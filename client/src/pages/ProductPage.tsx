import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  ArrowLeft, ShoppingCart, MessageSquare, Star, Package,
  ChevronLeft, ChevronRight, Shield, Truck, RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = trpc.products.getById.useQuery(
    { id: productId },
    { enabled: !isNaN(productId) }
  );

  const createCheckout = trpc.orders.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        toast.success("Redirecting to checkout...");
        window.open(data.checkoutUrl, "_blank");
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const startChat = trpc.chat.startConversation.useMutation({
    onSuccess: (conv) => navigate(`/chat/${conv.id}`),
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="aspect-square shimmer rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 shimmer rounded w-3/4" />
              <div className="h-6 shimmer rounded w-1/3" />
              <div className="h-24 shimmer rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Product not found</h2>
          <Link href="/marketplace"><Button className="gradient-purple text-white">Back to Marketplace</Button></Link>
        </div>
      </div>
    );
  }

  const images = Array.isArray(product.images) ? product.images : [];
  const price = typeof product.price === "string" ? parseFloat(product.price) : product.price;
  const isOwner = user?.id === product.sellerId;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        {/* Breadcrumb */}
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image gallery */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-card border border-border">
              {images.length > 0 ? (
                <img src={images[imageIndex]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-24 h-24 text-muted-foreground/20" />
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setImageIndex((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-primary/20 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setImageIndex((i) => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-primary/20 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImageIndex(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === imageIndex ? "border-primary" : "border-border"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className={product.status === "active" ? "text-green-400 border-green-400/30 bg-green-400/10" : "text-muted-foreground"}>
                  {product.status === "active" ? "● In Stock" : "● Unavailable"}
                </Badge>
                {product.featured && (
                  <Badge className="bg-primary/20 text-primary border-primary/30">Featured</Badge>
                )}
              </div>
              <h1 className="text-3xl font-black leading-tight mb-3">{product.name}</h1>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">({product.salesCount} sold)</span>
                <span className="text-sm text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">{product.viewCount} views</span>
              </div>

              <div className="text-4xl font-black" style={{ color: "var(--wize-green)" }}>
                ${price.toFixed(2)}
              </div>
            </div>

            {product.description && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            {/* Stock info */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Stock:</span>
              <span className={`font-semibold ${product.stock > 10 ? "text-green-400" : product.stock > 0 ? "text-orange-400" : "text-destructive"}`}>
                {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
              </span>
            </div>

            {/* Quantity selector */}
            {!isOwner && product.stock > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">Quantity:</span>
                <div className="flex items-center gap-2 bg-secondary rounded-xl p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg hover:bg-border flex items-center justify-center transition-colors font-bold"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="w-8 h-8 rounded-lg hover:bg-border flex items-center justify-center transition-colors font-bold"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">
                  Total: <span className="text-foreground font-bold">${(price * quantity).toFixed(2)}</span>
                </span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {isOwner ? (
                <Link href={`/dashboard/products/${product.id}/edit`} className="flex-1">
                  <Button className="w-full gradient-purple text-white font-bold glow-purple">Edit Product</Button>
                </Link>
              ) : product.status === "active" && product.stock > 0 ? (
                <>
                  <Button
                    size="lg"
                    className="flex-1 gradient-purple text-white font-bold glow-purple hover:opacity-90 transition-all gap-2"
                    disabled={createCheckout.isPending}
                    onClick={() => {
                      if (!isAuthenticated) {
                        window.location.href = getLoginUrl();
                        return;
                      }
                      createCheckout.mutate({ productId, quantity, origin: window.location.origin });
                    }}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {createCheckout.isPending ? "Processing..." : `Buy Now · $${(price * quantity).toFixed(2)}`}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 border-border hover:border-primary hover:text-primary"
                    onClick={() => {
                      if (!isAuthenticated) {
                        window.location.href = getLoginUrl();
                        return;
                      }
                      startChat.mutate({ sellerId: product.sellerId, productId });
                    }}
                  >
                    <MessageSquare className="w-5 h-5" />
                    Chat Seller
                  </Button>
                </>
              ) : (
                <Button size="lg" disabled className="flex-1">
                  {product.stock === 0 ? "Out of Stock" : "Unavailable"}
                </Button>
              )}
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/50">
              {[
                { icon: <Shield className="w-4 h-4" />, label: "Buyer Protection" },
                { icon: <Truck className="w-4 h-4" />, label: "Fast Delivery" },
                { icon: <RefreshCw className="w-4 h-4" />, label: "Easy Returns" },
              ].map((b) => (
                <div key={b.label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card border border-border text-center">
                  <div className="text-primary">{b.icon}</div>
                  <span className="text-xs text-muted-foreground font-medium">{b.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
