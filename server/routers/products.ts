import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createProduct,
  deleteProduct,
  getFeaturedProducts,
  getLatestProducts,
  getProductById,
  getSellerProducts,
  incrementProductView,
  searchProducts,
  toggleProductStatus,
  updateProduct,
  getCategories,
} from "../db";
import { notifyOwner } from "../_core/notification";
import { storagePut } from "../storage";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

export const productsRouter = router({
  // ── Public ──────────────────────────────────────────────────────────────────
  categories: publicProcedure.query(() => getCategories()),

  featured: publicProcedure.query(() => getFeaturedProducts(12)),

  latest: publicProcedure.query(() => getLatestProducts(20)),

  search: publicProcedure
    .input(
      z.object({
        query: z.string().optional(),
        categoryId: z.number().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        sortBy: z.enum(["newest", "price_asc", "price_desc", "popular"]).optional(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().default(0),
      })
    )
    .query(({ input }) => searchProducts(input)),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const product = await getProductById(input.id);
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      await incrementProductView(input.id);
      return product;
    }),

  // ── Seller ──────────────────────────────────────────────────────────────────
  myProducts: protectedProcedure.query(({ ctx }) => getSellerProducts(ctx.user.id)),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        price: z.number().positive(),
        categoryId: z.number().optional(),
        stock: z.number().int().min(0).default(0),
        images: z.array(z.string()).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = await createProduct({
        sellerId: ctx.user.id,
        name: input.name,
        description: input.description,
        price: input.price.toFixed(2),
        categoryId: input.categoryId,
        stock: input.stock,
        images: input.images,
      });

      await notifyOwner({
        title: "New Product Listed on WIZE",
        content: `Seller ${ctx.user.name ?? ctx.user.email} listed a new product: "${input.name}" at $${input.price.toFixed(2)}.`,
      });

      return { id };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        price: z.number().positive().optional(),
        categoryId: z.number().optional(),
        stock: z.number().int().min(0).optional(),
        images: z.array(z.string()).optional(),
        status: z.enum(["active", "inactive"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, price, ...rest } = input;
      await updateProduct(id, ctx.user.id, {
        ...rest,
        ...(price !== undefined ? { price: price.toFixed(2) } : {}),
      });
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteProduct(input.id, ctx.user.id);
      return { success: true };
    }),

  toggleStatus: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const newStatus = await toggleProductStatus(input.id, ctx.user.id);
      return { status: newStatus };
    }),

  // ── Upload ──────────────────────────────────────────────────────────────────
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
        size: z.number().max(5 * 1024 * 1024), // 5MB max
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Return a signed upload token — actual upload happens via multipart
      const ext = input.filename.split(".").pop() ?? "jpg";
      const key = `products/${ctx.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      return { key, contentType: input.contentType };
    }),

  uploadImage: protectedProcedure
    .input(
      z.object({
        key: z.string(),
        base64: z.string(),
        contentType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.base64, "base64");
      const { url } = await storagePut(input.key, buffer, input.contentType);
      return { url };
    }),
});
