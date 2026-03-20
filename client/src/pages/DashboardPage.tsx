import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  Plus, Package, TrendingUp, Eye, ToggleLeft, ToggleRight,
  Edit, Trash2, LayoutDashboard, ShoppingBag, MessageSquare,
} from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();

  const { data: products, isLoading } = trpc.products.myProducts.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const toggleStatus = trpc.products.toggleStatus.useMutation({
    onSuccess: (data) => {
      utils.products.myProducts.invalidate();
      toast.success(`Product ${data.status === "active" ? "activated" : "deactivated"}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteProduct = trpc.products.delete.useMutation({
    onSuccess: () => {
      utils.products.myProducts.invalidate();
      toast.success("Product deleted");
    },
    onError: (err) => toast.error(err.message),
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <LayoutDashboard className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Sign in to access your dashboard</h2>
          <p className="text-muted-foreground mb-6">Manage your products and track your sales.</p>
          <Button className="gradient-purple text-white" onClick={() => (window.location.href = getLoginUrl())}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const activeCount = products?.filter((p) => p.status === "active").length ?? 0;
  const totalSales = products?.reduce((sum, p) => sum + p.salesCount, 0) ?? 0;
  const totalViews = products?.reduce((sum, p) => sum + p.viewCount, 0) ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black">Seller Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {user?.name ?? "Seller"}</p>
          </div>
          <Link href="/dashboard/products/new">
            <Button className="gradient-purple text-white font-bold gap-2 glow-purple hover:opacity-90">
              <Plus className="w-4 h-4" /> New Product
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Products", value: products?.length ?? 0, icon: <Package className="w-5 h-5" />, color: "var(--wize-purple)" },
            { label: "Active Listings", value: activeCount, icon: <ToggleRight className="w-5 h-5" />, color: "var(--wize-green)" },
            { label: "Total Sales", value: totalSales, icon: <TrendingUp className="w-5 h-5" />, color: "var(--wize-blue)" },
            { label: "Total Views", value: totalViews, icon: <Eye className="w-5 h-5" />, color: "oklch(0.7 0.15 45)" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-5 rounded-2xl bg-card border border-border"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}20`, color: stat.color }}>
                  {stat.icon}
                </div>
              </div>
              <div className="text-3xl font-black">{stat.value.toLocaleString()}</div>
            </motion.div>
          ))}
        </div>

        {/* Quick links */}
        <div className="flex gap-3 mb-8">
          <Link href="/orders">
            <Button variant="outline" className="gap-2 border-border hover:border-primary hover:text-primary">
              <ShoppingBag className="w-4 h-4" /> View Orders
            </Button>
          </Link>
          <Link href="/chat">
            <Button variant="outline" className="gap-2 border-border hover:border-primary hover:text-primary">
              <MessageSquare className="w-4 h-4" /> Messages
            </Button>
          </Link>
        </div>

        {/* Products list */}
        <div>
          <h2 className="text-xl font-bold mb-4">My Products</h2>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 shimmer rounded-2xl" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="space-y-3">
              {products.map((product, i) => {
                const images = Array.isArray(product.images) ? product.images : [];
                const price = typeof product.price === "string" ? parseFloat(product.price) : product.price;
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-border/80 transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-secondary shrink-0">
                      {images[0] ? (
                        <img src={images[0]} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                        <Badge
                          className={`shrink-0 text-xs ${product.status === "active" ? "bg-green-400/10 text-green-400 border-green-400/20" : "bg-muted text-muted-foreground border-border"}`}
                        >
                          {product.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-bold" style={{ color: "var(--wize-green)" }}>${price.toFixed(2)}</span>
                        <span>Stock: {product.stock}</span>
                        <span>{product.salesCount} sold</span>
                        <span>{product.viewCount} views</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-primary"
                        onClick={() => toggleStatus.mutate({ id: product.id })}
                        title={product.status === "active" ? "Deactivate" : "Activate"}
                      >
                        {product.status === "active" ? (
                          <ToggleRight className="w-5 h-5 text-green-400" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                      </Button>
                      <Link href={`/dashboard/products/${product.id}/edit`}>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-popover border-border">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Product</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{product.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => deleteProduct.mutate({ id: product.id })}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl bg-card border border-border border-dashed">
              <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">No products yet</h3>
              <p className="text-muted-foreground mb-6">Start selling by listing your first product.</p>
              <Link href="/dashboard/products/new">
                <Button className="gradient-purple text-white gap-2">
                  <Plus className="w-4 h-4" /> List Your First Product
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
