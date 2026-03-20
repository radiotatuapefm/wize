import { TRPCError } from "@trpc/server";
import { z } from "zod";
import Stripe from "stripe";
import {
  createOrder,
  getOrdersByBuyer,
  getOrdersBySeller,
  getProductById,
  updateOrderStatus,
} from "../db";
import { notifyOwner } from "../_core/notification";
import { protectedProcedure, router } from "../_core/trpc";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe not configured" });
  return new Stripe(key);
}

export const ordersRouter = router({
  myOrders: protectedProcedure.query(({ ctx }) => getOrdersByBuyer(ctx.user.id)),

  sellerOrders: protectedProcedure.query(({ ctx }) => getOrdersBySeller(ctx.user.id)),

  createCheckout: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        quantity: z.number().int().min(1).default(1),
        origin: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const product = await getProductById(input.productId);
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      if (product.status !== "active")
        throw new TRPCError({ code: "BAD_REQUEST", message: "Product is not available" });
      if (product.stock < input.quantity)
        throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient stock" });
      if (product.sellerId === ctx.user.id)
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot buy your own product" });

      const stripe = getStripe();
      const totalAmount = (Number(product.price) * input.quantity).toFixed(2);

      // Create pending order first
      const orderId = await createOrder({
        buyerId: ctx.user.id,
        sellerId: product.sellerId,
        productId: input.productId,
        quantity: input.quantity,
        totalAmount,
      });

      const productImages = Array.isArray(product.images) ? product.images : [];

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: ctx.user.email ?? undefined,
        allow_promotion_codes: true,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          user_id: ctx.user.id.toString(),
          order_id: orderId.toString(),
          product_id: input.productId.toString(),
          customer_email: ctx.user.email ?? "",
          customer_name: ctx.user.name ?? "",
        },
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: product.name,
                description: product.description ?? undefined,
                images: productImages.slice(0, 1),
              },
              unit_amount: Math.round(Number(product.price) * 100),
            },
            quantity: input.quantity,
          },
        ],
        success_url: `${input.origin}/orders?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${input.origin}/product/${input.productId}?cancelled=true`,
      });

      // Update order with stripe session id
      await updateOrderStatus(session.id, "pending");

      await notifyOwner({
        title: "New Order on WIZE",
        content: `Order #${orderId} created for product "${product.name}" - $${totalAmount} by ${ctx.user.name ?? ctx.user.email}`,
      });

      return { checkoutUrl: session.url, orderId, sessionId: session.id };
    }),
});
