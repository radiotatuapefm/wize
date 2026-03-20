import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createMessage,
  getConversationMessages,
  getOrCreateConversation,
  getUserConversations,
  getUserById,
  getProductById,
} from "../db";
import { invokeLLM } from "../_core/llm";
import { protectedProcedure, router } from "../_core/trpc";

async function moderateAndSuggest(
  content: string,
  context: string
): Promise<{
  flagged: boolean;
  reason?: string;
  suggestion?: string;
}> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a marketplace chat moderator. Analyze the message for:
1. Spam or scam attempts
2. Inappropriate content (hate speech, harassment, explicit content)
3. Off-platform payment requests (trying to bypass the marketplace)
4. Provide a helpful response suggestion for the seller if the message is from a buyer.

Respond with JSON only:
{
  "flagged": boolean,
  "reason": "reason if flagged, otherwise null",
  "suggestion": "a helpful 1-2 sentence response suggestion for the other party"
}`,
        },
        {
          role: "user",
          content: `Context: ${context}\n\nMessage to moderate: "${content}"`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "moderation_result",
          strict: true,
          schema: {
            type: "object",
            properties: {
              flagged: { type: "boolean" },
              reason: { type: ["string", "null"] },
              suggestion: { type: ["string", "null"] },
            },
            required: ["flagged", "reason", "suggestion"],
            additionalProperties: false,
          },
        },
      },
    });

    const rawContent = response.choices?.[0]?.message?.content;
    const raw = typeof rawContent === 'string' ? rawContent : null;
    if (!raw) return { flagged: false };
    const parsed = JSON.parse(raw);
    return {
      flagged: parsed.flagged ?? false,
      reason: parsed.reason ?? undefined,
      suggestion: parsed.suggestion ?? undefined,
    };
  } catch {
    return { flagged: false };
  }
}

export const chatRouter = router({
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const convos = await getUserConversations(ctx.user.id);
    // Enrich with user info
    const enriched = await Promise.all(
      convos.map(async (c) => {
        const otherUserId = c.buyerId === ctx.user.id ? c.sellerId : c.buyerId;
        const otherUser = await getUserById(otherUserId);
        const product = c.productId ? await getProductById(c.productId) : null;
        return {
          ...c,
          otherUser: otherUser
            ? { id: otherUser.id, name: otherUser.name, avatarUrl: otherUser.avatarUrl }
            : null,
          product: product ? { id: product.id, name: product.name, images: product.images } : null,
        };
      })
    );
    return enriched;
  }),

  getMessages: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ ctx, input }) => {
      // Verify user is part of this conversation
      const convos = await getUserConversations(ctx.user.id);
      const conv = convos.find((c) => c.id === input.conversationId);
      if (!conv) throw new TRPCError({ code: "FORBIDDEN" });
      return getConversationMessages(input.conversationId);
    }),

  startConversation: protectedProcedure
    .input(
      z.object({
        sellerId: z.number(),
        productId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.id === input.sellerId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot chat with yourself" });
      }
      const conv = await getOrCreateConversation(ctx.user.id, input.sellerId, input.productId);
      return conv;
    }),

  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        content: z.string().min(1).max(2000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user is part of this conversation
      const convos = await getUserConversations(ctx.user.id);
      const conv = convos.find((c) => c.id === input.conversationId);
      if (!conv) throw new TRPCError({ code: "FORBIDDEN" });

      const otherUserId = conv.buyerId === ctx.user.id ? conv.sellerId : conv.buyerId;
      const otherUser = await getUserById(otherUserId);
      const context = `Marketplace chat. Sender: ${ctx.user.name ?? "User"}. Recipient: ${otherUser?.name ?? "User"}.`;

      // Run LLM moderation in parallel (non-blocking for UX)
      const moderation = await moderateAndSuggest(input.content, context);

      const message = await createMessage({
        conversationId: input.conversationId,
        senderId: ctx.user.id,
        content: input.content,
        moderated: true,
        moderationFlag: moderation.flagged,
        moderationReason: moderation.reason,
        llmSuggestion: moderation.suggestion,
      });

      return { message, suggestion: moderation.suggestion, flagged: moderation.flagged };
    }),
});
