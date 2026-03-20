import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useState, useRef, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Upload, X, Package, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [stock, setStock] = useState("1");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const { data: product, isLoading } = trpc.products.getById.useQuery(
    { id: productId },
    { enabled: !isNaN(productId) && isAuthenticated }
  );
  const { data: categories } = trpc.products.categories.useQuery();

  useEffect(() => {
    if (product && !initialized) {
      setName(product.name);
      setDescription(product.description ?? "");
      setPrice(String(typeof product.price === "string" ? parseFloat(product.price) : product.price));
      setCategoryId(product.categoryId ? String(product.categoryId) : "");
      setStock(String(product.stock));
      setImages(Array.isArray(product.images) ? product.images : []);
      setInitialized(true);
    }
  }, [product, initialized]);

  const getUploadUrl = trpc.products.getUploadUrl.useMutation();
  const uploadImage = trpc.products.uploadImage.useMutation();

  const updateProduct = trpc.products.update.useMutation({
    onSuccess: () => {
      utils.products.myProducts.invalidate();
      utils.products.getById.invalidate({ id: productId });
      toast.success("Product updated!");
      navigate("/dashboard");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (images.length + files.length > 5) { toast.error("Maximum 5 images"); return; }
    setUploading(true);
    try {
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} too large`); continue; }
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const pureBase64 = base64.split(",")[1] ?? base64;
        const contentType = file.type || "image/jpeg";
        const urlData = await getUploadUrl.mutateAsync({ filename: file.name, contentType, size: file.size });
        const result = await uploadImage.mutateAsync({ key: urlData.key, base64: pureBase64, contentType });
        setImages((prev) => [...prev, result.url]);
      }
    } finally { setUploading(false); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name required");
    if (!price || parseFloat(price) <= 0) return toast.error("Valid price required");
    updateProduct.mutate({
      id: productId,
      name: name.trim(),
      description: description.trim() || undefined,
      price: parseFloat(price),
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      stock: parseInt(stock),
      images,
    });
  };

  if (isLoading) return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="container py-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 max-w-2xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-black mb-2">Edit Product</h1>
          <p className="text-muted-foreground mb-8">Update your product details.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Images */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">Product Images (up to 5)</Label>
              <div className="flex flex-wrap gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-border">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center hover:bg-destructive transition-colors">
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    className="w-24 h-24 rounded-xl border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-all">
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                    <span className="text-xs">{uploading ? "Uploading..." : "Add Image"}</span>
                  </button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
            </div>

            <div>
              <Label htmlFor="name" className="text-sm font-semibold mb-2 block">Product Name *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="bg-card border-border focus:border-primary" required />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-semibold mb-2 block">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="bg-card border-border focus:border-primary resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" className="text-sm font-semibold mb-2 block">Price (USD) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                  <Input id="price" type="number" min="0.01" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="pl-7 bg-card border-border focus:border-primary" required />
                </div>
              </div>
              <div>
                <Label htmlFor="stock" className="text-sm font-semibold mb-2 block">Stock *</Label>
                <Input id="stock" type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} className="bg-card border-border focus:border-primary" required />
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold mb-2 block">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="bg-card border-border">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1 gradient-purple text-white font-bold glow-purple hover:opacity-90" disabled={updateProduct.isPending || uploading}>
                {updateProduct.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Save Changes"}
              </Button>
              <Link href="/dashboard">
                <Button type="button" variant="outline" className="border-border">Cancel</Button>
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
