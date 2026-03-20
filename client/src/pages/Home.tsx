import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  ArrowRight, Zap, Shield, TrendingUp, Package,
  Cpu, Shirt, Home as HomeIcon, Dumbbell, BookOpen,
  Sparkles, Gamepad2, Car, UtensilsCrossed, Palette,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Cpu: <Cpu className="w-6 h-6" />, Shirt: <Shirt className="w-6 h-6" />,
  Home: <HomeIcon className="w-6 h-6" />, Dumbbell: <Dumbbell className="w-6 h-6" />,
  BookOpen: <BookOpen className="w-6 h-6" />, Sparkles: <Sparkles className="w-6 h-6" />,
  Gamepad2: <Gamepad2 className="w-6 h-6" />, Car: <Car className="w-6 h-6" />,
  UtensilsCrossed: <UtensilsCrossed className="w-6 h-6" />, Palette: <Palette className="w-6 h-6" />,
};

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { data: featured, isLoading: featuredLoading } = trpc.products.featured.useQuery();
  const { data: latest, isLoading: latestLoading } = trpc.products.latest.useQuery();
  const { data: categories } = trpc.products.categories.useQuery();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 animated-bg opacity-60" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: "var(--wize-purple)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ background: "var(--wize-blue)" }} />
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Zap className="w-3.5 h-3.5" /> The Future of Marketplace
              </div>
              <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
                Buy &amp; Sell <span className="gradient-text-purple">Anything</span><br />with Confidence
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                WIZE connects buyers and sellers in a premium marketplace. Discover unique products, sell with ease, and transact securely.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/marketplace">
                  <Button size="lg" className="gradient-purple text-white font-bold px-8 rounded-xl glow-purple hover:opacity-90 transition-all gap-2">
                    Explore Marketplace <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                {isAuthenticated ? (
                  <Link href="/dashboard/products/new">
                    <Button size="lg" variant="outline" className="border-border hover:border-primary hover:text-primary px-8 rounded-xl font-bold">List a Product</Button>
                  </Link>
                ) : (
                  <Button size="lg" variant="outline" className="border-border hover:border-primary hover:text-primary px-8 rounded-xl font-bold" onClick={() => (window.location.href = getLoginUrl())}>
                    Start Selling
                  </Button>
                )}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex items-center justify-center gap-8 mt-16 pt-8 border-t border-border/50">
              {[{ label: "Products Listed", value: "10K+" }, { label: "Active Sellers", value: "2K+" }, { label: "Happy Buyers", value: "50K+" }].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-black gradient-text-green">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-y border-border/50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Zap className="w-6 h-6" />, title: "Lightning Fast", desc: "Instant checkout with Stripe-powered payments.", color: "var(--wize-purple)" },
              { icon: <Shield className="w-6 h-6" />, title: "Buyer Protection", desc: "Every purchase is secured and verified.", color: "var(--wize-blue)" },
              { icon: <TrendingUp className="w-6 h-6" />, title: "Grow Your Sales", desc: "Smart tools to help sellers reach more buyers.", color: "var(--wize-green)" },
            ].map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }} className="flex items-start gap-4 p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${f.color}20`, color: f.color }}>{f.icon}</div>
                <div><h3 className="font-bold text-foreground mb-1">{f.title}</h3><p className="text-sm text-muted-foreground">{f.desc}</p></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="py-16">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black">Shop by Category</h2>
              <Link href="/marketplace"><Button variant="ghost" size="sm" className="text-primary gap-1">View all <ArrowRight className="w-3.5 h-3.5" /></Button></Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {categories.slice(0, 10).map((cat, i) => (
                <motion.div key={cat.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.04 }}>
                  <Link href={`/marketplace?category=${cat.id}`}>
                    <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-card border border-border hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group">
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all">
                        {CATEGORY_ICONS[cat.icon ?? ""] ?? <Package className="w-6 h-6" />}
                      </div>
                      <span className="text-xs font-semibold text-center text-muted-foreground group-hover:text-foreground transition-colors">{cat.name}</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured */}
      <section className="py-16 bg-card/30">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div><h2 className="text-2xl font-black">Featured Products</h2><p className="text-sm text-muted-foreground mt-1">Hand-picked by our team</p></div>
            <Link href="/marketplace"><Button variant="ghost" size="sm" className="text-primary gap-1">See all <ArrowRight className="w-3.5 h-3.5" /></Button></Link>
          </div>
          {featuredLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="rounded-2xl bg-card border border-border overflow-hidden"><div className="aspect-square shimmer" /><div className="p-4 space-y-2"><div className="h-4 shimmer rounded" /><div className="h-4 shimmer rounded w-2/3" /></div></div>)}</div>
          ) : featured && featured.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">{featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}</div>
          ) : (
            <div className="text-center py-16"><Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" /><p className="text-muted-foreground">No featured products yet.</p><Link href="/dashboard/products/new"><Button className="mt-4 gradient-purple text-white">List your first product</Button></Link></div>
          )}
        </div>
      </section>

      {/* Latest */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div><h2 className="text-2xl font-black">New Arrivals</h2><p className="text-sm text-muted-foreground mt-1">Fresh listings just added</p></div>
            <Link href="/marketplace?sort=newest"><Button variant="ghost" size="sm" className="text-primary gap-1">See all <ArrowRight className="w-3.5 h-3.5" /></Button></Link>
          </div>
          {latestLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">{[...Array(10)].map((_, i) => <div key={i} className="rounded-2xl bg-card border border-border overflow-hidden"><div className="aspect-square shimmer" /><div className="p-4 space-y-2"><div className="h-4 shimmer rounded" /><div className="h-4 shimmer rounded w-2/3" /></div></div>)}</div>
          ) : latest && latest.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">{latest.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}</div>
          ) : (
            <div className="text-center py-16"><Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" /><p className="text-muted-foreground">No products listed yet. Be the first!</p><Link href="/dashboard/products/new"><Button className="mt-4 gradient-purple text-white">Start Selling</Button></Link></div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative overflow-hidden rounded-3xl p-10 md:p-16 text-center" style={{ background: "linear-gradient(135deg, oklch(0.13 0.06 295), oklch(0.11 0.05 255))", border: "1px solid oklch(0.55 0.22 295 / 0.3)" }}>
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background: "var(--wize-purple)" }} />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black mb-4">Ready to start selling?</h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">Join thousands of sellers on WIZE. List your products in minutes and reach buyers worldwide.</p>
              {isAuthenticated ? (
                <Link href="/dashboard/products/new"><Button size="lg" className="gradient-purple text-white font-bold px-10 glow-purple hover:opacity-90">List a Product Now</Button></Link>
              ) : (
                <Button size="lg" className="gradient-purple text-white font-bold px-10 glow-purple hover:opacity-90" onClick={() => (window.location.href = getLoginUrl())}>Get Started Free</Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-10">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-purple flex items-center justify-center"><Zap className="w-3.5 h-3.5 text-white" /></div>
              <span className="font-black text-lg gradient-text-purple">WIZE</span>
            </div>
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} WIZE Marketplace. All rights reserved.</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/marketplace" className="hover:text-foreground transition-colors">Marketplace</Link>
              <Link href="/dashboard" className="hover:text-foreground transition-colors">Sell</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
