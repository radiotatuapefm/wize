import { motion } from "framer-motion";
import { ShoppingCart, Star, Package } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface Product {
  id: number;
  name: string;
  price: string | number;
  images: string[] | null;
  salesCount: number;
  stock: number;
  status: "active" | "inactive";
  categoryId?: number | null;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (id: number) => void;
  index?: number;
}

export default function ProductCard({ product, onAddToCart, index = 0 }: ProductCardProps) {
  const price = typeof product.price === "string" ? parseFloat(product.price) : product.price;
  const images = Array.isArray(product.images) ? product.images : [];
  const mainImage = images[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="product-card group relative rounded-2xl bg-card border border-border overflow-hidden"
    >
      {/* Image */}
      <Link href={`/product/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-secondary">
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-12 h-12 text-muted-foreground/30" />
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Stock badge */}
          {product.stock <= 5 && product.stock > 0 && (
            <Badge className="absolute top-2 left-2 bg-orange-500/90 text-white text-xs border-0">
              Only {product.stock} left
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge className="absolute top-2 left-2 bg-destructive/90 text-white text-xs border-0">
              Out of stock
            </Badge>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2 mb-1 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({product.salesCount})</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div>
            <span
              className="text-lg font-bold"
              style={{ color: "var(--wize-green)" }}
            >
              ${price.toFixed(2)}
            </span>
          </div>

          {onAddToCart && product.stock > 0 ? (
            <Button
              size="sm"
              onClick={() => onAddToCart(product.id)}
              className="h-8 px-3 text-xs font-semibold gradient-purple text-white border-0 glow-purple hover:opacity-90 transition-opacity"
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              Buy
            </Button>
          ) : (
            <Link href={`/product/${product.id}`}>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs border-border hover:border-primary hover:text-primary transition-colors"
              >
                View
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Gradient helper used in className
function gradient_purple(s: string) { return s; }
