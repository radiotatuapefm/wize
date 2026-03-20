import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { ShoppingBag, Package, ExternalLink, CheckCircle, Clock, XCircle } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG = {
  completed: { icon: <CheckCircle className="w-4 h-4" />, color: "text-green-400", bg: "bg-green-400/10 border-green-400/20", label: "Completed" },
  pending: { icon: <Clock className="w-4 h-4" />, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20", label: "Pending" },
  failed: { icon: <XCircle className="w-4 h-4" />, color: "text-destructive", bg: "bg-destructive/10 border-destructive/20", label: "Failed" },
  refunded: { icon: <XCircle className="w-4 h-4" />, color: "text-muted-foreground", bg: "bg-muted border-border", label: "Refunded" },
} as const;

export default function OrdersPage() {
  const { isAuthenticated, loading } = useAuth();
  const { data: orders, isLoading } = trpc.orders.myOrders.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading || (!isAuthenticated && !loading)) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Sign in to view your orders</h2>
          <Button className="gradient-purple text-white" onClick={() => (window.location.href = getLoginUrl())}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 max-w-3xl">
        <h1 className="text-3xl font-black mb-2">My Orders</h1>
        <p className="text-muted-foreground mb-8">Track your purchase history.</p>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-28 shimmer rounded-2xl" />)}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order, i) => {
              const cfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
              const amount = typeof order.totalAmount === "string" ? parseFloat(order.totalAmount) : (order.totalAmount ?? 0);
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="p-5 rounded-2xl bg-card border border-border"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Product image */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-secondary shrink-0">
                      {false ? (
                        <img src="" alt="" className="w-full h-full object-cover" />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">
                          {`Order #${order.id}`}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Qty: {order.quantity} · {new Date(order.createdAt).toLocaleDateString()}
                        {" "}&middot; Product #{order.productId}
                        </p>
                        <Badge className={`text-xs gap-1 ${cfg.color} ${cfg.bg}`}>
                          {cfg.icon} {cfg.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xl font-black" style={{ color: "var(--wize-green)" }}>
                        ${amount.toFixed(2)}
                      </div>
                      <Link href={`/product/${order.productId}`}>
                          <Button variant="ghost" size="sm" className="mt-2 gap-1 text-xs text-muted-foreground hover:text-primary">
                            View Product <ExternalLink className="w-3 h-3" />
                          </Button>
                        </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 rounded-2xl bg-card border border-border border-dashed">
            <ShoppingBag className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">Start shopping to see your orders here.</p>
            <Link href="/marketplace">
              <Button className="gradient-purple text-white">Browse Marketplace</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
