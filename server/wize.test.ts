import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { COOKIE_NAME } from "../shared/const";

// ─── Helpers ──────────────────────────────────────────────────────────────────

type AuthUser = NonNullable<TrpcContext["user"]>;

function makeUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 1,
    openId: "test-open-id",
    email: "test@wize.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    emailVerified: false,
    avatarUrl: null,
    bio: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
}

function makeCtx(user: AuthUser | null = null): TrpcContext {
  const clearedCookies: { name: string; options: Record<string, unknown> }[] = [];
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
      _clearedCookies: clearedCookies,
    } as unknown as TrpcContext["res"],
  };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

describe("auth.me", () => {
  it("returns null when unauthenticated", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user when authenticated", async () => {
    const user = makeUser();
    const caller = appRouter.createCaller(makeCtx(user));
    const result = await caller.auth.me();
    expect(result).toMatchObject({ id: 1, email: "test@wize.com" });
  });
});

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const ctx = makeCtx(makeUser());
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    const cleared = (ctx.res as any)._clearedCookies as { name: string; options: Record<string, unknown> }[];
    expect(cleared).toHaveLength(1);
    expect(cleared[0]?.name).toBe(COOKIE_NAME);
    expect(cleared[0]?.options).toMatchObject({ maxAge: -1, httpOnly: true, path: "/" });
  });
});

// ─── Products ─────────────────────────────────────────────────────────────────

describe("products.categories", () => {
  it("returns an array (may be empty without DB)", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    // Without a real DB the helper returns []
    const result = await caller.products.categories();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("products.featured", () => {
  it("returns an array", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    const result = await caller.products.featured();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("products.latest", () => {
  it("returns an array", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    const result = await caller.products.latest();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("products.search", () => {
  it("returns items and total", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    const result = await caller.products.search({});
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.items)).toBe(true);
    expect(typeof result.total).toBe("number");
  });

  it("accepts query and sort params", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    const result = await caller.products.search({ query: "test", sortBy: "popular", limit: 5 });
    expect(result).toHaveProperty("items");
  });
});

describe("products.myProducts (protected)", () => {
  it("throws UNAUTHORIZED when not authenticated", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(caller.products.myProducts()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("returns array when authenticated", async () => {
    const caller = appRouter.createCaller(makeCtx(makeUser()));
    const result = await caller.products.myProducts();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("products.create (protected)", () => {
  it("throws UNAUTHORIZED when not authenticated", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(
      caller.products.create({ name: "Test", price: 9.99, stock: 1, images: [] })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});

describe("products.delete (protected)", () => {
  it("throws UNAUTHORIZED when not authenticated", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(caller.products.delete({ id: 1 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});

describe("products.toggleStatus (protected)", () => {
  it("throws UNAUTHORIZED when not authenticated", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(caller.products.toggleStatus({ id: 1 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});

// ─── Chat ─────────────────────────────────────────────────────────────────────

describe("chat.getConversations (protected)", () => {
  it("throws UNAUTHORIZED when not authenticated", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(caller.chat.getConversations()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("returns array when authenticated", async () => {
    const caller = appRouter.createCaller(makeCtx(makeUser()));
    const result = await caller.chat.getConversations();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("chat.startConversation (protected)", () => {
  it("throws UNAUTHORIZED when not authenticated", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(caller.chat.startConversation({ sellerId: 2 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws BAD_REQUEST when chatting with yourself", async () => {
    const user = makeUser({ id: 5 });
    const caller = appRouter.createCaller(makeCtx(user));
    await expect(caller.chat.startConversation({ sellerId: 5 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("chat.sendMessage (protected)", () => {
  it("throws UNAUTHORIZED when not authenticated", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(caller.chat.sendMessage({ conversationId: 1, content: "Hello" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});

// ─── Orders ───────────────────────────────────────────────────────────────────

describe("orders.myOrders (protected)", () => {
  it("throws UNAUTHORIZED when not authenticated", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(caller.orders.myOrders()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("returns array when authenticated", async () => {
    const caller = appRouter.createCaller(makeCtx(makeUser()));
    const result = await caller.orders.myOrders();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("orders.createCheckout (protected)", () => {
  it("throws UNAUTHORIZED when not authenticated", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(
      caller.orders.createCheckout({ productId: 1, quantity: 1, origin: "https://example.com" })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});

// ─── System ───────────────────────────────────────────────────────────────────

describe("system.notifyOwner (protected)", () => {
  it("throws when not authenticated (UNAUTHORIZED or FORBIDDEN)", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(
      caller.system.notifyOwner({ title: "Test", content: "Test notification" })
    ).rejects.toHaveProperty("code");
  });
});
