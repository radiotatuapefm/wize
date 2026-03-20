import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
] as const;

export default function MarketplacePage() {
  const [location] = useLocation();
  const params = useMemo(() => new URLSearchParams(location.split("?")[1] ?? ""), [location]);

  const [query, setQuery] = useState(params.get("q") ?? "");
  const [inputValue, setInputValue] = useState(params.get("q") ?? "");
  const [categoryId, setCategoryId] = useState<number | undefined>(
    params.get("category") ? Number(params.get("category")) : undefined
  );
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc" | "popular">(
    (params.get("sort") as any) ?? "newest"
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  const [offset, setOffset] = useState(0);

  const { data: categories } = trpc.products.categories.useQuery();
  const { data, isLoading } = trpc.products.search.useQuery({
    query: query || undefined,
    categoryId,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 1000 ? priceRange[1] : undefined,
    sortBy,
    limit: 20,
    offset,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(inputValue);
    setOffset(0);
  };

  const clearFilters = () => {
    setQuery("");
    setInputValue("");
    setCategoryId(undefined);
    setSortBy("newest");
    setPriceRange([0, 1000]);
    setOffset(0);
  };

  const hasFilters = query || categoryId || priceRange[0] > 0 || priceRange[1] < 1000;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-2">Marketplace</h1>
          <p className="text-muted-foreground">
            {data ? `${data.total} products found` : "Discover amazing products"}
          </p>
        </div>

        {/* Search + Sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
            <Button type="submit" className="gradient-purple text-white shrink-0">
              Search
            </Button>
          </form>

          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={(v) => { setSortBy(v as any); setOffset(0); }}>
              <SelectTrigger className="w-44 bg-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className={`gap-2 border-border ${showFilters ? "border-primary text-primary" : ""}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasFilters && <Badge className="h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground text-xs">!</Badge>}
            </Button>
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-6 rounded-2xl bg-card border border-border"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Category */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-3 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { setCategoryId(undefined); setOffset(0); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!categoryId ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
                  >
                    All
                  </button>
                  {categories?.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { setCategoryId(cat.id); setOffset(0); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${categoryId === cat.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-3 block">
                  Price Range: ${priceRange[0]} – ${priceRange[1] === 1000 ? "1000+" : priceRange[1]}
                </label>
                <Slider
                  min={0}
                  max={1000}
                  step={10}
                  value={priceRange}
                  onValueChange={(v) => setPriceRange(v as [number, number])}
                  className="mt-4"
                />
              </div>

              {/* Clear */}
              <div className="flex items-end">
                {hasFilters && (
                  <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2 border-destructive text-destructive hover:bg-destructive/10">
                    <X className="w-3.5 h-3.5" /> Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Active filter chips */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {query && (
              <Badge variant="secondary" className="gap-1 pl-3 pr-2 py-1">
                Search: "{query}"
                <button onClick={() => { setQuery(""); setInputValue(""); }}><X className="w-3 h-3" /></button>
              </Badge>
            )}
            {categoryId && (
              <Badge variant="secondary" className="gap-1 pl-3 pr-2 py-1">
                {categories?.find((c) => c.id === categoryId)?.name}
                <button onClick={() => setCategoryId(undefined)}><X className="w-3 h-3" /></button>
              </Badge>
            )}
          </div>
        )}

        {/* Product grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-card border border-border overflow-hidden">
                <div className="aspect-square shimmer" />
                <div className="p-4 space-y-2">
                  <div className="h-4 shimmer rounded" />
                  <div className="h-4 shimmer rounded w-2/3" />
                  <div className="h-8 shimmer rounded mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.items && data.items.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {data.items.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>

            {/* Pagination */}
            {data.total > 20 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <Button
                  variant="outline"
                  disabled={offset === 0}
                  onClick={() => setOffset(Math.max(0, offset - 20))}
                  className="border-border"
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {Math.floor(offset / 20) + 1} of {Math.ceil(data.total / 20)}
                </span>
                <Button
                  variant="outline"
                  disabled={offset + 20 >= data.total}
                  onClick={() => setOffset(offset + 20)}
                  className="border-border"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24">
            <Search className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your search or filters.</p>
            <Button onClick={clearFilters} className="gradient-purple text-white">Clear all filters</Button>
          </div>
        )}
      </div>
    </div>
  );
}
