import { and, desc, eq, ilike, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  Category,
  Conversation,
  InsertProduct,
  InsertUser,
  Message,
  OtpToken,
  Order,
  Product,
  categories,
  conversations,
  messages,
  orders,
  otpTokens,
  products,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function updateUserProfile(
  id: number,
  data: { name?: string; bio?: string; avatarUrl?: string; emailVerified?: boolean }
) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, id));
}

// ─── OTP ──────────────────────────────────────────────────────────────────────
export async function createOtp(
  userId: number,
  email: string,
  type: "email_verify" | "password_reset"
): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  // Invalidate old OTPs of same type
  await db
    .update(otpTokens)
    .set({ used: true })
    .where(and(eq(otpTokens.userId, userId), eq(otpTokens.type, type), eq(otpTokens.used, false)));

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await db.insert(otpTokens).values({ userId, email, code, type, expiresAt });
  return code;
}

export async function verifyOtp(
  userId: number,
  code: string,
  type: "email_verify" | "password_reset"
): Promise<OtpToken | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(otpTokens)
    .where(
      and(
        eq(otpTokens.userId, userId),
        eq(otpTokens.code, code),
        eq(otpTokens.type, type),
        eq(otpTokens.used, false)
      )
    )
    .limit(1);

  const token = result[0];
  if (!token) return null;
  if (token.expiresAt < new Date()) return null;

  await db.update(otpTokens).set({ used: true }).where(eq(otpTokens.id, token.id));
  return token;
}

// ─── Categories ───────────────────────────────────────────────────────────────
export async function getCategories(): Promise<Category[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(categories.name);
}

// ─── Products ─────────────────────────────────────────────────────────────────
export async function createProduct(data: InsertProduct): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(products).values(data);
  return (result[0] as any).insertId;
}

export async function updateProduct(id: number, sellerId: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(products)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(products.id, id), eq(products.sellerId, sellerId)));
}

export async function deleteProduct(id: number, sellerId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(products).where(and(eq(products.id, id), eq(products.sellerId, sellerId)));
}

export async function getProductById(id: number): Promise<Product | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function getSellerProducts(sellerId: number): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(products)
    .where(eq(products.sellerId, sellerId))
    .orderBy(desc(products.createdAt));
}

export async function toggleProductStatus(id: number, sellerId: number) {
  const db = await getDb();
  if (!db) return;
  const product = await getProductById(id);
  if (!product || product.sellerId !== sellerId) return;
  const newStatus = product.status === "active" ? "inactive" : "active";
  await db
    .update(products)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(products.id, id));
  return newStatus;
}

export async function getFeaturedProducts(limit = 12): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(products)
    .where(and(eq(products.status, "active"), eq(products.featured, true)))
    .orderBy(desc(products.salesCount))
    .limit(limit);
}

export async function searchProducts(opts: {
  query?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "newest" | "price_asc" | "price_desc" | "popular";
  limit?: number;
  offset?: number;
}): Promise<{ items: Product[]; total: number }> {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const conditions = [eq(products.status, "active")];

  if (opts.query) {
    conditions.push(
      or(
        like(products.name, `%${opts.query}%`),
        like(products.description, `%${opts.query}%`)
      ) as any
    );
  }
  if (opts.categoryId) conditions.push(eq(products.categoryId, opts.categoryId));
  if (opts.minPrice !== undefined)
    conditions.push(sql`${products.price} >= ${opts.minPrice}` as any);
  if (opts.maxPrice !== undefined)
    conditions.push(sql`${products.price} <= ${opts.maxPrice}` as any);

  const where = and(...conditions);

  let orderBy;
  switch (opts.sortBy) {
    case "price_asc":
      orderBy = sql`${products.price} ASC`;
      break;
    case "price_desc":
      orderBy = sql`${products.price} DESC`;
      break;
    case "popular":
      orderBy = desc(products.salesCount);
      break;
    default:
      orderBy = desc(products.createdAt);
  }

  const [items, countResult] = await Promise.all([
    db
      .select()
      .from(products)
      .where(where)
      .orderBy(orderBy as any)
      .limit(opts.limit ?? 20)
      .offset(opts.offset ?? 0),
    db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(where),
  ]);

  return { items, total: Number(countResult[0]?.count ?? 0) };
}

export async function incrementProductView(id: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(products)
    .set({ viewCount: sql`${products.viewCount} + 1` })
    .where(eq(products.id, id));
}

export async function getLatestProducts(limit = 20): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(products)
    .where(eq(products.status, "active"))
    .orderBy(desc(products.createdAt))
    .limit(limit);
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export async function createOrder(data: {
  buyerId: number;
  sellerId: number;
  productId: number;
  quantity: number;
  totalAmount: string;
  stripeSessionId?: string;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(orders).values(data);
  return (result[0] as any).insertId;
}

export async function updateOrderStatus(
  stripeSessionId: string,
  status: Order["status"],
  paymentIntentId?: string
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(orders)
    .set({ status, stripePaymentIntentId: paymentIntentId, updatedAt: new Date() })
    .where(eq(orders.stripeSessionId, stripeSessionId));
}

export async function getOrdersByBuyer(buyerId: number): Promise<Order[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(orders)
    .where(eq(orders.buyerId, buyerId))
    .orderBy(desc(orders.createdAt));
}

export async function getOrdersBySeller(sellerId: number): Promise<Order[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(orders)
    .where(eq(orders.sellerId, sellerId))
    .orderBy(desc(orders.createdAt));
}

// ─── Conversations ────────────────────────────────────────────────────────────
export async function getOrCreateConversation(
  buyerId: number,
  sellerId: number,
  productId?: number
): Promise<Conversation> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const existing = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.buyerId, buyerId), eq(conversations.sellerId, sellerId)))
    .limit(1);

  if (existing[0]) return existing[0];

  await db.insert(conversations).values({ buyerId, sellerId, productId });
  const created = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.buyerId, buyerId), eq(conversations.sellerId, sellerId)))
    .limit(1);
  return created[0];
}

export async function getUserConversations(userId: number): Promise<Conversation[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(conversations)
    .where(or(eq(conversations.buyerId, userId), eq(conversations.sellerId, userId)) as any)
    .orderBy(desc(conversations.lastMessageAt));
}

export async function getConversationMessages(
  conversationId: number,
  limit = 50
): Promise<Message[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt)
    .limit(limit);
}

export async function createMessage(data: {
  conversationId: number;
  senderId: number;
  content: string;
  moderated?: boolean;
  moderationFlag?: boolean;
  moderationReason?: string;
  llmSuggestion?: string;
}): Promise<Message> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  await db.insert(messages).values(data);
  await db
    .update(conversations)
    .set({ lastMessageAt: new Date() })
    .where(eq(conversations.id, data.conversationId));

  const result = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, data.conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(1);
  return result[0];
}
