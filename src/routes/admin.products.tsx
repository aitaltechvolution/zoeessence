import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/format";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Star, Upload, Image as ImageIcon } from "lucide-react";
import { InlineSpinner, PageLoader } from "@/components/site/PageLoader";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

const CATEGORIES = ["Clothing", "Shoes", "Bags", "Accessories"] as const;

interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  description: string | null;
  image_url: string | null;
  tags: string[] | null;
  featured: boolean;
}

const empty = {
  title: "",
  category: "Clothing",
  price: "",
  description: "",
  image_url: "",
  tags: "",
  featured: false,
};

function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleImageUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) {
      setUploading(false);
      toast.error(error.message);
      return;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setForm((f) => ({ ...f, image_url: data.publicUrl }));
    setUploading(false);
    toast.success("Image uploaded");
  }

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    setProducts((data ?? []) as Product[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function startNew() {
    setEditing(null);
    setForm(empty);
    setShowForm(true);
  }

  function startEdit(p: Product) {
    setEditing(p);
    setForm({
      title: p.title,
      category: p.category,
      price: String(p.price),
      description: p.description ?? "",
      image_url: p.image_url ?? "",
      tags: (p.tags ?? []).join(", "),
      featured: p.featured,
    });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.price) {
      toast.error("Title and price are required");
      return;
    }
    const price = Number(form.price);
    if (isNaN(price) || price < 0) {
      toast.error("Enter a valid price");
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      category: form.category,
      price,
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      featured: form.featured,
    };
    const { error } = editing
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editing ? "Product updated" : "Product created");
    setShowForm(false);
    load();
  }

  async function handleDelete(p: Product) {
    setDeleting(true);
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    setDeleting(false);
    if (error) return toast.error(error.message);
    toast.success("Product deleted");
    setProductToDelete(null);
    load();
  }

  async function toggleFeatured(p: Product) {
    const { error } = await supabase
      .from("products")
      .update({ featured: !p.featured })
      .eq("id", p.id);
    if (error) return toast.error(error.message);
    load();
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-4xl">Products</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {products.length} item{products.length === 1 ? "" : "s"}
          </p>
        </div>
        <button
          onClick={startNew}
          className="inline-flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-[0.2em] bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-3.5 w-3.5" /> New product
        </button>
      </div>

      {loading ? (
        <PageLoader label="Loading products" />
      ) : products.length === 0 ? (
        <div className="bg-card border border-border p-12 text-center">
          <p className="font-serif text-2xl mb-2">No products yet</p>
          <p className="text-sm text-muted-foreground">Add your first product to start selling.</p>
        </div>
      ) : (
        <div className="bg-card border border-border overflow-hidden">
          <div className="hidden lg:grid lg:grid-cols-[80px_1fr_140px_120px_100px_140px] gap-4 px-5 py-3 border-b border-border text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <div>Image</div>
            <div>Title</div>
            <div>Category</div>
            <div>Price</div>
            <div>Featured</div>
            <div className="text-right">Actions</div>
          </div>
          <div className="divide-y divide-border">
            {products.map((p) => (
              <div
                key={p.id}
                className="lg:grid lg:grid-cols-[80px_1fr_140px_120px_100px_140px] lg:gap-4 lg:items-center px-5 py-4 flex flex-col gap-3"
              >
                <div className="w-16 h-20 bg-muted overflow-hidden">
                  {p.image_url && (
                    <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{p.title}</p>
                  {p.tags && p.tags.length > 0 && (
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">
                      {p.tags.join(" · ")}
                    </p>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{p.category}</div>
                <div className="text-sm">{formatNaira(Number(p.price))}</div>
                <div>
                  <button
                    onClick={() => toggleFeatured(p)}
                    className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] px-2 py-1 ${p.featured ? "text-gold" : "text-muted-foreground"}`}
                    title="Toggle featured"
                  >
                    <Star className={`h-3.5 w-3.5 ${p.featured ? "fill-current" : ""}`} />
                    {p.featured ? "Yes" : "No"}
                  </button>
                </div>
                <div className="flex lg:justify-end gap-2">
                  <button
                    onClick={() => startEdit(p)}
                    className="p-2 border border-border hover:border-foreground"
                    aria-label="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setProductToDelete(p)}
                    className="p-2 border border-border hover:border-destructive hover:text-destructive"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <div
          className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 fade-up"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-background w-full max-w-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-serif text-2xl">{editing ? "Edit product" : "New product"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 md:p-6 space-y-5">
              <Field label="Title">
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Category">
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className={inputCls}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Price (₦)">
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className={inputCls}
                  />
                </Field>
              </div>
              <Field label="Product image">
                <div className="flex items-start gap-4">
                  <div className="w-24 h-28 bg-muted border border-border overflow-hidden flex items-center justify-center shrink-0">
                    {form.image_url ? (
                      <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.2em] border border-border hover:border-foreground cursor-pointer disabled:opacity-60">
                      {uploading ? <InlineSpinner /> : <Upload className="h-3.5 w-3.5" />}
                      {uploading ? "Uploading…" : form.image_url ? "Replace image" : "Upload image"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleImageUpload(f);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {form.image_url && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image_url: "" })}
                        className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-destructive"
                      >
                        Remove
                      </button>
                    )}
                    <p className="text-[11px] text-muted-foreground">PNG or JPG, up to 5MB.</p>
                  </div>
                </div>
              </Field>
              <Field label="Description">
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Tags (comma separated)">
                <input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="New, Bestseller"
                  className={inputCls}
                />
              </Field>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                />
                Featured on homepage
              </label>

              <div className="flex gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-3 text-xs uppercase tracking-[0.2em] border border-border hover:border-foreground"
                >
                  Cancel
                </button>
                <button
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-xs uppercase tracking-[0.2em] bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  {saving && <InlineSpinner />}
                  {saving ? "Saving…" : editing ? "Save changes" : "Create product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteDialog
        open={!!productToDelete}
        loading={deleting}
        title="Delete this product?"
        description={
          productToDelete
            ? `This will permanently remove “${productToDelete.title}” from the Zoe Essence shop. This action cannot be undone.`
            : "This product will be permanently removed from the shop."
        }
        onOpenChange={(open) => !open && setProductToDelete(null)}
        onConfirm={() => productToDelete && handleDelete(productToDelete)}
      />
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2.5 bg-transparent border border-border focus:border-foreground outline-none text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
