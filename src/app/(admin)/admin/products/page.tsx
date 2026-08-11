"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Product } from "@/data/products";
import { useProductStore } from "@/store/useProductStore";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import {
  Plus, Search, Edit2, Trash2, Gem, X, Upload,
  Link as LinkIcon, Images, Star, ChevronLeft, ChevronRight,
  CheckCircle2, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";

const MAX_IMAGES = 6;

/* ─────────────────────────── helpers ─────────────────────────── */
function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ─────────────────────────── types ───────────────────────────── */
interface ImageSlot {
  url: string;
  uploading?: boolean;
  originalSize?: number;
  compressedSize?: number;
}

/* ═══════════════════════════ PAGE ════════════════════════════════ */
export default function ProductsPage() {
  const { getToken } = useAuth();
  const { products, fetchProducts, addProduct, updateProduct, deleteProduct } =
    useProductStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const CATEGORIES = [
    "Earrings", "Neckpiece", "Bracelets", "Finger Rings",
    "Hair Accessories", "Korean Earrings", "Traditional Earrings",
    "Xuping Earrings", "Xuping Neckpiece", "Xuping Bracelets",
    "Xuping Finger Rings", "Bands", "Chains", "Rings", "Uncategorized",
  ];
  const FILTER_CATEGORIES = ["All", ...CATEGORIES];

  /* ── Form state ── */
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState<string>("");
  const [formCategory, setFormCategory] = useState("Earrings");
  const [formDescription, setFormDescription] = useState("");
  const [formStock, setFormStock] = useState<string>("");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formIsImported, setFormIsImported] = useState(false);
  const [formIsSoldOut, setFormIsSoldOut] = useState(false);
  // All images as ordered slots; slot[0] is the cover
  const [slots, setSlots] = useState<ImageSlot[]>([]);
  const [productId, setProductId] = useState("");

  /* ── Preview carousel in modal ── */
  const [previewIdx, setPreviewIdx] = useState(0);

  const resetForm = () => {
    setProductId("");
    setFormName("");
    setFormPrice("");
    setFormCategory("Earrings");
    setFormDescription("");
    setFormStock("0");
    setFormFeatured(false);
    setFormIsImported(false);
    setFormIsSoldOut(false);
    setSlots([]);
    setPreviewIdx(0);
  };

  const filtered = useMemo(() => {
    let result = products;
    if (searchQuery.trim()) {
      const lq = searchQuery.toLowerCase();
      result = products.filter(
        (p) => p.name.toLowerCase().includes(lq) || p.id.toLowerCase().includes(lq)
      );
    }
    if (selectedCategoryFilter) {
      result = result.filter((p) => p.category === selectedCategoryFilter);
    }
    return result;
  }, [products, searchQuery, selectedCategoryFilter]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setProductId(product.id);
    setFormName(product.name);
    setFormPrice(String(product.price));
    setFormCategory(product.category || "Earrings");
    setFormDescription(product.description || "");
    setFormStock(String(product.stock || 0));
    setFormFeatured(product.featured || false);
    setFormIsImported(product.isImported || false);
    setFormIsSoldOut(Boolean(product.isSoldOut || (product as any).is_sold_out || product.soldOut));

    // Merge cover + gallery into ordered slots
    const all: string[] = [];
    if (product.image) all.push(product.image);
    if (product.images?.length) {
      product.images.forEach((img) => {
        if (img && !all.includes(img)) all.push(img);
      });
    }
    setSlots(all.slice(0, MAX_IMAGES).map((url) => ({ url })));
    setPreviewIdx(0);
    setIsModalOpen(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    const token = await getToken();
    if (!token) return toast.error("Unauthorized");
    try {
      await deleteProduct(product.id, token);
      toast.success("Product deleted");
      if (isModalOpen && editingProduct?.id === product.id) setIsModalOpen(false);
    } catch {
      toast.error("Failed to delete product");
    }
  };

  /* ── Upload a single file → returns ImageSlot ── */
  const compressAndUpload = useCallback(
    async (file: File): Promise<ImageSlot | null> => {
      const originalSize = file.size;
      let compressedFile = file;

      try {
        compressedFile = await imageCompression(file, {
          maxSizeMB: 0.3,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
          initialQuality: 0.75,
        });
      } catch {
        // fallback – use original if compression fails
      }

      const fd = new FormData();
      fd.append("file", compressedFile, compressedFile.name || file.name);

      const token = await getToken();
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const result = await res.json();

      if (!res.ok) {
        toast.error(`Upload failed: ${result.error}`);
        return null;
      }

      return {
        url: result.url as string,
        originalSize,
        compressedSize: compressedFile.size,
      };
    },
    [getToken]
  );

  /* ── Handle file input change ── */
  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const available = MAX_IMAGES - slots.length;
    if (available <= 0) {
      toast.warning(`Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }
    const toProcess = files.slice(0, available);
    if (files.length > available) {
      toast.info(`Only ${available} slot(s) remaining — first ${available} images uploaded.`);
    }

    // Insert placeholder slots immediately (shows spinners)
    const placeholders: ImageSlot[] = toProcess.map(() => ({ url: "", uploading: true }));
    setSlots((prev) => [...prev, ...placeholders]);

    const results = await Promise.allSettled(toProcess.map((f) => compressAndUpload(f)));

    setSlots((prev) => {
      const updated = [...prev];
      let pi = 0;
      for (let i = 0; i < updated.length; i++) {
        if (updated[i].uploading) {
          const r = results[pi++];
          if (r.status === "fulfilled" && r.value) {
            updated[i] = r.value;
          } else {
            updated.splice(i, 1);
            i--;
          }
          if (pi >= results.length) break;
        }
      }
      return updated;
    });

    toast.success(`${toProcess.length} image(s) uploaded & compressed`);
    // Reset input
    e.target.value = "";
  };

  const removeSlot = (idx: number) => {
    setSlots((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      return next;
    });
    setPreviewIdx((prev) => Math.max(0, prev - (prev >= idx ? 1 : 0)));
  };

  const moveSlot = (from: number, to: number) => {
    setSlots((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
  };

  /* ── Save ── */
  const handleSave = async () => {
    const readySlots = slots.filter((s) => s.url && !s.uploading);
    const coverUrl = readySlots[0]?.url || "https://via.placeholder.com/300?text=No+Image";
    const galleryUrls = readySlots.slice(1).map((s) => s.url);

    const finalProduct: Product = {
      id: productId,
      name: formName || "Unnamed Product",
      price: parseFloat(formPrice) || 0,
      category: formCategory || "Uncategorized",
      image: coverUrl,
      images: galleryUrls,
      description: formDescription,
      stock: parseInt(formStock) || 0,
      featured: formFeatured,
      isImported: formIsImported,
      isSoldOut: formIsSoldOut,
      is_sold_out: formIsSoldOut,
      soldOut: formIsSoldOut,
    };

    const token = await getToken();
    if (!token) return toast.error("Unauthorized");

    try {
      if (editingProduct) {
        await updateProduct(finalProduct, token);
        toast.success("Product updated!");
      } else {
        await addProduct(finalProduct, token);
        toast.success("Product added!");
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(`Failed to save: ${(err as Error)?.message ?? "Unknown error"}`);
    }
  };

  const isUploading = slots.some((s) => s.uploading);
  const slotsUsed = slots.length;

  return (
    <div className="p-4 md:p-8 max-w-[1400px]">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 pt-4 md:pt-0">
        <div>
          <p className="text-[10px] font-mono text-[#bbb] uppercase tracking-[0.2em]">Admin</p>
          <h1 className="text-2xl md:text-3xl font-serif text-[#2C2C2C] mt-0.5 tracking-tight">Products</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none sm:w-56">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ccc]" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#F0EDE8] rounded-full pl-8 pr-4 py-2 text-xs text-[#555] placeholder-[#ccc] focus:outline-none focus:border-[#F5B8C8] transition-all"
            />
          </div>
          <button
            onClick={() => fetchProducts()}
            className="flex items-center gap-1.5 bg-white border border-blue-100 text-blue-500 text-xs px-3 py-2 rounded-full hover:bg-blue-50 transition-colors"
          >
            <Gem size={13} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={handleAddProduct}
            className="flex items-center gap-1.5 bg-[#2C2C2C] text-white text-xs px-3 py-2 rounded-full hover:bg-[#E8809A] transition-colors"
          >
            <Plus size={13} />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>

      {/* ── Category filters ── */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTER_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategoryFilter(cat === "All" ? null : cat)}
            className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border transition-all ${
              (cat === "All" && !selectedCategoryFilter) || selectedCategoryFilter === cat
                ? "bg-[#2C2C2C] text-white border-[#2C2C2C]"
                : "bg-white text-[#888] border-[#F0EDE8] hover:border-[#ccc]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <p className="text-[10px] font-mono text-[#bbb] uppercase tracking-[0.15em] mb-4">
        {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* ── Product grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        {filtered.map((product) => {
          const totalImages = (product.images?.length ?? 0) + (product.image ? 1 : 0);
          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-[#F0EDE8] overflow-hidden group hover:shadow-md hover:border-[#F5B8C8]/60 transition-all duration-300 flex flex-col"
            >
              <div className="aspect-square relative overflow-hidden bg-[#FAFAF8]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Image count badge */}
                {totalImages > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[9px] font-mono px-1.5 py-0.5 rounded-full flex items-center gap-1">
                    <Images size={9} />
                    {totalImages}
                  </div>
                )}
                {product.featured && (
                  <div className="absolute top-2 left-2 bg-[#D4AF37]/90 text-white text-[9px] font-mono px-1.5 py-0.5 rounded-full flex items-center gap-1">
                    <Star size={8} fill="white" />
                    Featured
                  </div>
                )}
              </div>

              <div className="p-3 flex flex-col flex-1">
                <p className="text-[9px] font-mono text-[#E8809A] uppercase tracking-wider mb-1">{product.category}</p>
                <p className="text-xs font-medium text-[#2C2C2C] truncate leading-tight">{product.name}</p>
                <div className="flex items-center justify-between mt-2 mb-3">
                  <div>
                    <span className="text-sm font-bold text-[#2C2C2C]">₹{product.price.toFixed(0)}</span>
                    <p className="text-[9px] text-[#bbb] mt-0.5">Stock: {product.stock || 0}</p>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium border ${
                    Boolean(product.isSoldOut || (product as any).is_sold_out || product.soldOut)
                      ? "text-red-600 bg-red-50 border-red-200 font-bold"
                      : "text-emerald-600 bg-emerald-50 border-emerald-100"
                  }`}>
                    {Boolean(product.isSoldOut || (product as any).is_sold_out || product.soldOut) ? "Sold Out" : "Active"}
                  </span>
                </div>

                <div className="mt-auto pt-3 border-t border-[#F0EDE8] flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-[#555] bg-gray-50 hover:bg-[#F5B8C8] hover:text-white rounded-lg transition-colors"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-[#555] bg-gray-50 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        <button
          onClick={handleAddProduct}
          className="aspect-square bg-[#FAFAF8] rounded-2xl border-2 border-dashed border-[#F0EDE8] hover:border-[#F5B8C8] hover:bg-[#F5B8C8]/5 transition-all duration-300 flex flex-col items-center justify-center gap-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#F5B8C8]/20 group-hover:bg-[#F5B8C8]/40 flex items-center justify-center transition-colors">
            <Plus size={18} className="text-[#E8809A]" />
          </div>
          <span className="text-[10px] font-mono text-[#bbb] group-hover:text-[#E8809A] uppercase tracking-[0.1em] transition-colors">
            Add Product
          </span>
        </button>
      </div>

      <div className="mt-8 flex items-center justify-center">
        <Link
          href="/catalog"
          className="flex items-center gap-2 text-[10px] font-mono text-[#bbb] hover:text-[#E8809A] uppercase tracking-[0.15em] transition-colors"
        >
          <Gem size={12} /> View Storefront Catalog
        </Link>
      </div>

      {/* ══════════════════════════ MODAL ══════════════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Modal header */}
            <div className="bg-white border-b border-[#F0EDE8] px-5 py-4 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-serif text-[#2C2C2C]">
                  {editingProduct ? "Edit Product" : "Add Product"}
                </h2>
                <p className="text-[10px] text-[#bbb] font-mono mt-0.5">
                  {slotsUsed}/{MAX_IMAGES} images · first image is the cover
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[#888] hover:text-[#2C2C2C] transition-colors rounded-full hover:bg-gray-100 p-1">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-6 flex-1">
              {/* ── Top two-column: info + main preview ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left: fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#555] mb-1.5">Product Name</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-white border border-[#F0EDE8] rounded-xl px-4 py-2.5 text-sm text-[#2C2C2C] focus:outline-none focus:border-[#F5B8C8] transition-all"
                      placeholder="Enter product name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#555] mb-1.5">Price (₹)</label>
                      <input
                        type="number"
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        className="w-full bg-white border border-[#F0EDE8] rounded-xl px-4 py-2.5 text-sm text-[#2C2C2C] focus:outline-none focus:border-[#F5B8C8] transition-all"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#555] mb-1.5">Stock Qty</label>
                      <input
                        type="number"
                        value={formStock}
                        onChange={(e) => setFormStock(e.target.value)}
                        className="w-full bg-white border border-[#F0EDE8] rounded-xl px-4 py-2.5 text-sm text-[#2C2C2C] focus:outline-none focus:border-[#F5B8C8] transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#555] mb-1.5">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full bg-white border border-[#F0EDE8] rounded-xl px-4 py-2.5 text-sm text-[#2C2C2C] focus:outline-none focus:border-[#F5B8C8] transition-all"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#555]">Description</label>
                      <button
                        type="button"
                        onClick={() => {
                          const t = `Material & Quality:\n- Premium Xuping alloy base\n- Long-lasting tarnish-resistant coating\n- 100% skin-friendly, anti-allergic\n\nFeatures & Design:\n- Exquisite and detailed classic design\n- Lightweight, durable, and comfortable\n- Perfect for weddings, festivals, or casual wear\n\nCare Tips:\n- Avoid contact with perfume, water, and direct heat\n- Wipe with a clean, dry microfiber cloth after use\n- Store in an airtight container or zip lock bag`;
                          setFormDescription(t);
                        }}
                        className="text-[9px] font-semibold text-[#E8809A] hover:text-[#c45c77] uppercase tracking-wider border border-[#F5B8C8]/30 px-2 py-0.5 rounded-md hover:bg-[#F5B8C8]/10 transition-all cursor-pointer"
                      >
                        Template
                      </button>
                    </div>
                    <textarea
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      rows={5}
                      className="w-full bg-white border border-[#F0EDE8] rounded-xl px-4 py-2.5 text-sm text-[#2C2C2C] focus:outline-none focus:border-[#F5B8C8] transition-all resize-none"
                      placeholder="Tell customers more about this piece..."
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-6 pt-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={formFeatured}
                        onChange={(e) => setFormFeatured(e.target.checked)}
                        className="w-4 h-4 rounded border-[#F0EDE8] text-[#E8809A] focus:ring-[#F5B8C8] cursor-pointer"
                      />
                      <label htmlFor="featured" className="text-xs font-semibold uppercase tracking-wider text-[#555] cursor-pointer">
                        Featured Product
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isSoldOut"
                        checked={formIsSoldOut}
                        onChange={(e) => setFormIsSoldOut(e.target.checked)}
                        className="w-4 h-4 rounded border-[#F0EDE8] text-red-500 focus:ring-red-300 cursor-pointer"
                      />
                      <label htmlFor="isSoldOut" className="text-xs font-semibold uppercase tracking-wider text-[#555] cursor-pointer flex items-center gap-1.5">
                        Mark as Sold Out
                        {formIsSoldOut && (
                          <span className="text-[9px] bg-red-100 text-red-700 border border-red-200 px-1.5 py-0.5 rounded font-mono font-bold">
                            SOLD OUT
                          </span>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right: cover image preview */}
                <div className="flex flex-col gap-3">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#555]">
                    Cover Preview
                  </label>

                  {slots[0]?.url ? (
                    <div className="relative aspect-square w-full max-w-[220px] mx-auto rounded-2xl overflow-hidden bg-[#FAFAF8] border border-[#F0EDE8] shadow-sm">
                      <Image src={slots[0].url} alt="Cover" fill className="object-cover" />
                      <div className="absolute top-2 left-2 bg-[#E8809A] text-white text-[8px] font-mono px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                        Cover
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-square w-full max-w-[220px] mx-auto rounded-2xl border-2 border-dashed border-[#F0EDE8] bg-[#FAFAF8] flex flex-col items-center justify-center text-[#ccc] gap-2">
                      <Upload size={28} />
                      <span className="text-xs">No cover yet</span>
                    </div>
                  )}

                  {/* Paste URL shortcut */}
                  <button
                    type="button"
                    onClick={() => {
                      if (slots.length >= MAX_IMAGES) {
                        toast.warning(`Max ${MAX_IMAGES} images reached`);
                        return;
                      }
                      const url = window.prompt("Paste image URL:");
                      if (url) setSlots((p) => [...p, { url }]);
                    }}
                    className="flex items-center justify-center gap-1.5 text-[10px] text-[#E8809A] hover:underline mt-1"
                  >
                    <LinkIcon size={10} /> Add via URL
                  </button>

                  {/* Compression info for cover */}
                  {slots[0]?.originalSize && (
                    <div className="text-[9px] font-mono text-[#aaa] text-center space-y-0.5">
                      <p>Original: {formatBytes(slots[0].originalSize)}</p>
                      <p className="text-green-600">Saved to: {formatBytes(slots[0].compressedSize ?? 0)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Image Gallery Grid ── */}
              <div className="border-t border-[#F0EDE8] pt-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#555]">
                      All Images ({slotsUsed}/{MAX_IMAGES})
                    </label>
                    <p className="text-[9px] text-[#bbb] mt-0.5">
                      Slot #1 = cover · use arrows to reorder · click × to remove
                    </p>
                  </div>
                  {slotsUsed < MAX_IMAGES && (
                    <label className={`flex items-center gap-1.5 text-[10px] font-semibold text-[#E8809A] border border-[#F5B8C8]/40 px-3 py-1.5 rounded-full cursor-pointer hover:bg-[#F5B8C8]/10 transition-all ${isUploading ? "opacity-50 pointer-events-none" : ""}`}>
                      <Upload size={11} />
                      Upload {MAX_IMAGES - slotsUsed > 1 ? `up to ${MAX_IMAGES - slotsUsed}` : "1 more"}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleFilePick}
                        disabled={isUploading}
                      />
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {Array.from({ length: MAX_IMAGES }).map((_, idx) => {
                    const slot = slots[idx];
                    const isEmpty = !slot;

                    return (
                      <div key={idx} className="relative group">
                        {/* Slot number label */}
                        <div className={`absolute -top-1.5 -left-1.5 z-10 w-4 h-4 rounded-full text-[8px] font-mono flex items-center justify-center font-bold ${
                          idx === 0 ? "bg-[#E8809A] text-white" : "bg-[#F0EDE8] text-[#999]"
                        }`}>
                          {idx + 1}
                        </div>

                        {slot?.uploading ? (
                          // Uploading spinner
                          <div className="aspect-square rounded-xl bg-[#F5B8C8]/10 border-2 border-[#F5B8C8]/30 flex items-center justify-center animate-pulse">
                            <div className="w-5 h-5 rounded-full border-2 border-[#E8809A] border-t-transparent animate-spin" />
                          </div>
                        ) : slot?.url ? (
                          // Filled slot
                          <div className="relative aspect-square rounded-xl overflow-hidden bg-[#FAFAF8] border border-[#F0EDE8] shadow-sm">
                            <Image src={slot.url} alt={`Image ${idx + 1}`} fill className="object-cover" />

                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                              {/* Move left */}
                              {idx > 0 && (
                                <button
                                  onClick={() => moveSlot(idx, idx - 1)}
                                  className="p-1 bg-white/90 rounded-full text-[#555] hover:bg-white transition-colors"
                                >
                                  <ChevronLeft size={12} />
                                </button>
                              )}
                              {/* Remove */}
                              <button
                                onClick={() => removeSlot(idx)}
                                className="p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                              >
                                <X size={12} />
                              </button>
                              {/* Move right */}
                              {idx < slots.length - 1 && (
                                <button
                                  onClick={() => moveSlot(idx, idx + 1)}
                                  className="p-1 bg-white/90 rounded-full text-[#555] hover:bg-white transition-colors"
                                >
                                  <ChevronRight size={12} />
                                </button>
                              )}
                            </div>

                            {/* Cover badge */}
                            {idx === 0 && (
                              <div className="absolute bottom-1 left-1 bg-[#E8809A]/90 text-white text-[7px] font-mono px-1 py-0.5 rounded uppercase tracking-wider pointer-events-none">
                                Cover
                              </div>
                            )}

                            {/* Size saved badge */}
                            {slot.originalSize && slot.compressedSize && (
                              <div className="absolute top-1 right-1 bg-green-500/80 text-white text-[7px] font-mono px-1 py-0.5 rounded pointer-events-none">
                                <CheckCircle2 size={7} className="inline mr-0.5" />
                                {formatBytes(slot.compressedSize)}
                              </div>
                            )}
                          </div>
                        ) : (
                          // Empty slot
                          <div className="aspect-square rounded-xl bg-[#FAFAF8] border-2 border-dashed border-[#F0EDE8] flex flex-col items-center justify-center text-[#e0dbd5] gap-1">
                            <AlertCircle size={14} />
                            <span className="text-[8px] font-mono">empty</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Total slots used bar */}
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-[#F0EDE8] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#E8809A] to-[#F5B8C8] rounded-full transition-all duration-500"
                      style={{ width: `${(slotsUsed / MAX_IMAGES) * 100}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-[#bbb] shrink-0">
                    {slotsUsed}/{MAX_IMAGES} used
                  </span>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="bg-white border-t border-[#F0EDE8] px-5 py-4 flex items-center justify-end gap-3 shrink-0">
              {editingProduct && (
                <button
                  onClick={() => handleDelete(editingProduct)}
                  className="mr-auto flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={13} /> Delete Product
                </button>
              )}
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 text-xs font-semibold text-[#555] hover:bg-gray-100 rounded-full transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isUploading}
                className="px-6 py-2 text-xs font-semibold bg-[#2C2C2C] text-white rounded-full hover:bg-[#E8809A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? "Uploading..." : "Save Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
