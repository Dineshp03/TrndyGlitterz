"use client";

import { useState, useMemo, useEffect } from "react";
import { Product } from "@/data/products";
import { useProductStore } from "@/store/useProductStore";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Plus, Search, Filter, Edit2, Trash2, Gem, X, Upload, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import imageCompression from 'browser-image-compression';

export default function ProductsPage() {
  const { getToken } = useAuth();
  const { products, fetchProducts, addProduct, updateProduct, deleteProduct, setProducts } = useProductStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const CATEGORIES = [
    "Earrings", 
    "Neckpiece", 
    "Bracelets", 
    "Finger Rings", 
    "Hair Accessories", 
    "Korean Earrings", 
    "Traditional Earrings", 
    "Xuping Earrings", 
    "Xuping Neckpiece", 
    "Xuping Bracelets", 
    "Xuping Finger Rings", 
    "Bands", 
    "Chains", 
    "Rings", 
    "Uncategorized"
  ];
  const FILTER_CATEGORIES = ["All", ...CATEGORIES];

  // Form state
  const [formData, setFormData] = useState<{
    id: string;
    name: string;
    price: number | string;
    category: string;
    image: string;
    images: string[];
    description: string;
    stock: number | string;
    featured: boolean;
    isImported: boolean;
  }>({
    id: '',
    name: '',
    price: '',
    category: 'Earrings',
    image: '',
    images: [],
    description: '',
    stock: '',
    featured: false,
    isImported: false
  });

  const filtered = useMemo(() => {
    let result = products;
    if (searchQuery.trim()) {
      const lowerQ = searchQuery.toLowerCase();
      result = products.filter(p => 
        p.name.toLowerCase().includes(lowerQ) || 
        p.id.toLowerCase().includes(lowerQ)
      );
    }
    if (selectedCategoryFilter) {
      result = result.filter(p => p.category === selectedCategoryFilter);
    }
    return result;
  }, [products, searchQuery, selectedCategoryFilter]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category || 'Earrings',
      image: product.image,
      images: product.images || [],
      description: product.description || '',
      stock: product.stock || 0,
      featured: product.featured || false,
      isImported: product.isImported || false
    });
    setIsModalOpen(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      id: '',
      name: '',
      price: '',
      category: 'Earrings',
      image: '',
      images: [],
      description: '',
      stock: 0,
      featured: false,
      isImported: false
    });
    setIsModalOpen(true);
  };


  const handleDelete = async (product: Product) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?\n\nThis action cannot be undone.`
    );
    
    if (!isConfirmed) return;

    const token = await getToken();
    if (!token) return toast.error("Unauthorized");
    
    try {
      await deleteProduct(product.id, token);
      toast.success("Product deleted successfully");
      if (isModalOpen && editingProduct?.id === product.id) {
        setIsModalOpen(false);
      }
    } catch (err) {
      toast.error("Failed to delete product");
    }
  };

  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file: File) => {
    if (!file) return null;

    try {
      toast.info("Compressing image...");
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(file, options);
      
      const formData = new FormData();
      formData.append('file', compressedFile, compressedFile.name || file.name);

      const token = await getToken();
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Upload API error:', result.error);
        toast.error(`Upload failed: ${result.error}`);
        return null;
      }

      toast.success("Image uploaded successfully!");
      return result.url as string;
    } catch (err: any) {
      console.error('Unexpected upload error:', err);
      toast.error(`Upload error: ${err.message || 'Unknown error'}`);
      return null;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean = false) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      try {
        if (isMain) {
          const file = e.target.files[0];
          const url = await uploadImage(file);
          if (url) setFormData(prev => ({ ...prev, image: url }));
        } else {
          const files = Array.from(e.target.files);
          const uploadPromises = files.map(file => uploadImage(file));
          const urls = await Promise.all(uploadPromises);
          const validUrls = urls.filter((url): url is string => url !== null);
          setFormData(prev => ({ ...prev, images: [...prev.images, ...validUrls] }));
        }
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = async () => {
    const finalPrice = typeof formData.price === 'number' ? formData.price : parseFloat(formData.price as string) || 0;
    const finalStock = typeof formData.stock === 'number' ? formData.stock : parseInt(formData.stock as string) || 0;
    
    const finalProduct: Product = {
      id: formData.id,
      name: formData.name || 'Unnamed Product',
      price: finalPrice,
      category: formData.category || 'Uncategorized',
      image: formData.image || 'https://via.placeholder.com/300?text=No+Image',
      images: formData.images,
      description: formData.description,
      stock: finalStock,
      featured: formData.featured,
      isImported: formData.isImported
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
    } catch (err: any) {
      toast.error(`Failed to save: ${err?.message ?? 'Unknown error'}`);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1400px]">
      {/* Header */}
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
            <span className="hidden sm:inline">Refresh Data</span>
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

      <div className="flex flex-wrap gap-2 mb-5">
        {FILTER_CATEGORIES.map(cat => (
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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        {filtered.map((product) => (
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
                  (product.stock ?? 0) > 0 
                  ? "text-emerald-600 bg-emerald-50 border-emerald-100" 
                  : "text-red-600 bg-red-50 border-red-100"
                }`}>
                  {(product.stock ?? 0) > 0 ? "Active" : "Inactive"}
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
        ))}

        <button 
          onClick={handleAddProduct}
          className="aspect-square bg-[#FAFAF8] rounded-2xl border-2 border-dashed border-[#F0EDE8] hover:border-[#F5B8C8] hover:bg-[#F5B8C8]/5 transition-all duration-300 flex flex-col items-center justify-center gap-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#F5B8C8]/20 group-hover:bg-[#F5B8C8]/40 flex items-center justify-center transition-colors">
            <Plus size={18} className="text-[#E8809A]" />
          </div>
          <span className="text-[10px] font-mono text-[#bbb] group-hover:text-[#E8809A] uppercase tracking-[0.1em] transition-colors">Add Product</span>
        </button>
      </div>

      <div className="mt-8 flex items-center justify-center">
        <Link
          href="/catalog"
          className="flex items-center gap-2 text-[10px] font-mono text-[#bbb] hover:text-[#E8809A] uppercase tracking-[0.15em] transition-colors"
        >
          <Gem size={12} />
          View Storefront Catalog
        </Link>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="bg-white border-b border-[#F0EDE8] px-6 py-4 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-serif text-[#2C2C2C]">
                {editingProduct ? "Edit Product" : "Add Product"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#888] hover:text-[#2C2C2C] transition-colors rounded-full hover:bg-gray-100 p-1">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                   <div>
                     <label className="block text-xs font-semibold uppercase tracking-wider text-[#555] mb-2">Product Name</label>
                     <input 
                       type="text"
                       value={formData.name}
                       onChange={(e) => setFormData(p => ({...p, name: e.target.value}))}
                       className="w-full bg-white border border-[#F0EDE8] rounded-xl px-4 py-2.5 text-sm text-[#2C2C2C] focus:outline-none focus:border-[#F5B8C8] transition-all"
                       placeholder="Enter product name"
                     />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-semibold uppercase tracking-wider text-[#555] mb-2">Price (₹)</label>
                       <input 
                         type="number"
                         value={formData.price}
                         onChange={(e) => setFormData(p => ({...p, price: e.target.value}))}
                         className="w-full bg-white border border-[#F0EDE8] rounded-xl px-4 py-2.5 text-sm text-[#2C2C2C] focus:outline-none focus:border-[#F5B8C8] transition-all"
                         placeholder="0"
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-semibold uppercase tracking-wider text-[#555] mb-2">Stock Qty</label>
                       <input 
                         type="number"
                         value={formData.stock}
                         onChange={(e) => setFormData(p => ({...p, stock: e.target.value}))}
                         className="w-full bg-white border border-[#F0EDE8] rounded-xl px-4 py-2.5 text-sm text-[#2C2C2C] focus:outline-none focus:border-[#F5B8C8] transition-all"
                         placeholder="0"
                       />
                     </div>
                   </div>
                   <div>
                     <label className="block text-xs font-semibold uppercase tracking-wider text-[#555] mb-2">Category</label>
                     <select
                       value={formData.category}
                       onChange={(e) => setFormData(p => ({...p, category: e.target.value}))}
                       className="w-full bg-white border border-[#F0EDE8] rounded-xl px-4 py-2.5 text-sm text-[#2C2C2C] focus:outline-none focus:border-[#F5B8C8] transition-all"
                     >
                       {CATEGORIES.map(cat => (
                         <option key={cat} value={cat}>{cat}</option>
                       ))}
                     </select>
                   </div>
                    <div className="flex flex-col gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox"
                          id="featured"
                          checked={formData.featured}
                          onChange={(e) => setFormData(p => ({...p, featured: e.target.checked}))}
                          className="w-4 h-4 rounded border-[#F0EDE8] text-[#E8809A] focus:ring-[#F5B8C8]"
                        />
                        <label htmlFor="featured" className="text-xs font-semibold uppercase tracking-wider text-[#555] cursor-pointer">Mark as Featured Product</label>
                      </div>
                    </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#555] mb-2">Product Description</label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData(p => ({...p, description: e.target.value}))}
                      rows={5}
                      className="w-full bg-white border border-[#F0EDE8] rounded-xl px-4 py-2.5 text-sm text-[#2C2C2C] focus:outline-none focus:border-[#F5B8C8] transition-all resize-none"
                      placeholder="Tell customers more about this glamourous piece..."
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                       <label className="block text-xs font-semibold uppercase tracking-wider text-[#555]">Main Image</label>
                       <button 
                         onClick={() => {
                           const url = prompt("Enter image URL:");
                           if (url) setFormData(prev => ({ ...prev, image: url }));
                         }}
                         className="text-[10px] text-[#E8809A] hover:underline flex items-center gap-1"
                       >
                         <LinkIcon size={10} />
                         Or paste URL
                       </button>
                    </div>
                    {formData.image ? (
                      <div className="relative w-full sm:w-2/3 aspect-square bg-[#FAFAF8] rounded-xl overflow-hidden border border-[#F0EDE8] group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={formData.image} alt="Main" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => setFormData(p => ({...p, image: ''}))} 
                          className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full hover:bg-white text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full sm:w-2/3 aspect-square bg-[#FAFAF8] rounded-xl border-2 border-dashed border-[#F0EDE8] cursor-pointer hover:bg-[#F5B8C8]/5 hover:border-[#F5B8C8] transition-all">
                        {isUploading ? (
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full border-2 border-[#F5B8C8] border-t-transparent animate-spin mb-2" />
                            <span className="text-[10px] text-[#bbb]">Uploading...</span>
                          </div>
                        ) : (
                          <>
                            <Upload size={24} className="text-[#ccc] mb-2" />
                            <span className="text-xs text-[#888]">Upload Main Image</span>
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, true)} />
                          </>
                        )}
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#F0EDE8]">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#555] mb-3">Gallery Images ({formData.images.length})</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square bg-[#FAFAF8] rounded-xl overflow-hidden border border-[#F0EDE8] group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setFormData(p => ({...p, images: p.images.filter((_, i) => i !== idx)}))} 
                        className="absolute top-1 right-1 bg-white/90 p-1 rounded-full hover:bg-white text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <label className="flex flex-col items-center justify-center aspect-square bg-[#FAFAF8] rounded-xl border-2 border-dashed border-[#F0EDE8] cursor-pointer hover:bg-[#F5B8C8]/5 hover:border-[#F5B8C8] transition-all">
                    <Plus size={20} className="text-[#ccc]" />
                    <input type="file" className="hidden" accept="image/*" multiple onChange={(e) => handleFileUpload(e, false)} />
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white border-t border-[#F0EDE8] px-6 py-4 flex items-center justify-end gap-3 shrink-0">
              {editingProduct && (
                <button 
                  onClick={() => handleDelete(editingProduct)}
                  className="mr-auto flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={13} />
                  Delete Product
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
                className="px-6 py-2 text-xs font-semibold bg-[#2C2C2C] text-white rounded-full hover:bg-[#E8809A] transition-colors"
              >
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
