"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Package,
  Upload,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Save,
  Tag,
  Percent,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id;
  const productId = Array.isArray(rawId) ? rawId[0] : (typeof rawId === "string" ? decodeURIComponent(rawId) : "");

  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [hsnCodes, setHsnCodes] = useState<Array<{ id: string; hsnCode: string; sgst: number; cgst: number; description?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Health & Wellness");
  const [netQuantity, setNetQuantity] = useState("1 Unit");
  const [hsnCode, setHsnCode] = useState("30049011");
  const [hsnGst, setHsnGst] = useState(5.0);
  const [mrp, setMrp] = useState<number>(0);
  const [dp, setDp] = useState<number>(0);
  const [pv, setPv] = useState<number>(0);
  const [stock, setStock] = useState<number>(500);
  const [inStock, setInStock] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("Popular");

  useEffect(() => {
    async function loadProductData() {
      if (!productId) return;
      try {
        const [prodRes, catRes, hsnRes] = await Promise.allSettled([
          fetch(`/api/admin/products/${productId}`),
          fetch("/api/admin/categories"),
          fetch("/api/admin/hsn"),
        ]);

        if (catRes.status === "fulfilled") {
          const catData = await catRes.value.json();
          if (catData.success && catData.categories) setCategories(catData.categories);
        }

        if (hsnRes.status === "fulfilled") {
          const hsnData = await hsnRes.value.json();
          if (hsnData.success && hsnData.hsnCodes) setHsnCodes(hsnData.hsnCodes);
        }

        if (prodRes.status === "fulfilled") {
          const prodData = await prodRes.value.json();
          if (prodData.success && prodData.product) {
            const p = prodData.product;
            setName(p.name || "");
            setCategory(p.category || "Health & Wellness");
            setNetQuantity(p.netQuantity || "1 Unit");
            setHsnCode(p.hsnCode || "30049011");
            setHsnGst(p.hsnGst || 5.0);
            setMrp(Number(p.mrp || 0));
            setDp(Number(p.dp || p.discountPrice || p.mrp || 0));
            setPv(Number(p.pv || 0));
            setStock(Number(p.stock !== undefined ? p.stock : 500));
            setInStock(p.inStock !== false);
            setImageUrl(p.imageUrl || "");
            setDescription(p.description || "");
            setTag(p.tag || (p.pv >= 100 ? "Bestseller" : "Popular"));
          } else {
            console.error("Product fetch issue:", prodData.message);
          }
        }
      } catch (err) {
        console.error("Error loading product:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProductData();
  }, [productId, router]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      setImageUrl(base64Data);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: base64Data, folder: "products" }),
        });
        const data = await res.json();
        if (data.success && data.url) {
          setImageUrl(data.url);
        }
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleHsnSelect = (code: string) => {
    setHsnCode(code);
    const found = hsnCodes.find((h) => h.hsnCode === code);
    if (found) {
      setHsnGst(Number(found.sgst) + Number(found.cgst));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter product name");
      return;
    }

    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          category,
          hsnCode,
          netQuantity,
          mrp,
          dp,
          discountPrice: dp,
          pv,
          stock,
          inStock,
          imageUrl,
          description,
          tag,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        alert(data.message || "Failed to update product");
      }
    } catch (err) {
      console.error("Save product error:", err);
      alert("Network error updating product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        alert("Product deleted successfully!");
        router.push("/admin/products");
      } else {
        alert(data.message || "Failed to delete product");
      }
    } catch {
      alert("Network error deleting product");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-24 text-center text-[#006d36] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#006d36]" />
          <span className="text-sm font-bold font-mono">Loading Product Details...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-24 animate-fadeIn">
        {/* Top Breadcrumb & Controls */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#006d36] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products Catalog</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              <span>Delete Product</span>
            </button>
          </div>
        </div>

        {/* Executive Banner */}
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#022814] via-[#04331b] to-[#01170b] text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-emerald-900/30">
          <div className="flex items-center gap-4">
            <div className="w-16 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center overflow-hidden shrink-0 shadow-md p-1">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt={name} className="w-full h-full object-contain" />
              ) : (
                <Package className="w-8 h-8 text-emerald-300" />
              )}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold uppercase mb-1">
                <span>{category}</span>
                <span>•</span>
                <span>{pv} PV</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black">{name || "Edit Product"}</h1>
              <p className="text-xs text-emerald-200/80 font-mono">ID: {productId}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-right">
              <span className="text-[10px] text-emerald-300 block uppercase font-bold">DP Price</span>
              <span className="text-2xl font-black font-mono">₹{dp.toLocaleString("en-IN")}</span>
            </span>
          </div>
        </div>

        {/* Success Alert */}
        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#006d36] flex items-center gap-3 animate-scaleUp">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-xs font-bold">Product updated and saved successfully!</span>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-2xs space-y-5">
                <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#006d36]" />
                  <span>General Information</span>
                </h3>

                {/* Product Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#006d36]/20 focus:border-[#006d36]"
                    placeholder="e.g. Avira Multi Vitamin Capsule"
                  />
                </div>

                {/* Category & Volume Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#006d36]/20 focus:border-[#006d36] bg-white"
                    >
                      <option value="Health & Wellness">Health & Wellness</option>
                      <option value="Agriculture & Plant Care">Agriculture & Plant Care</option>
                      <option value="Personal Care & Skin">Personal Care & Skin</option>
                      <option value="Hair Care">Hair Care</option>
                      <option value="Combo & Activation Packages">Combo & Activation Packages</option>
                      <option value="Oral Care">Oral Care</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Women Care & Hygiene">Women Care & Hygiene</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Net Quantity / Volume</label>
                    <input
                      type="text"
                      value={netQuantity}
                      onChange={(e) => setNetQuantity(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#006d36]/20 focus:border-[#006d36]"
                      placeholder="e.g. 30 tab, 500 ml, 100 gm"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Product Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-normal focus:outline-hidden focus:ring-2 focus:ring-[#006d36]/20 focus:border-[#006d36]"
                    placeholder="Provide details on formula, health benefits, and usage directions..."
                  />
                </div>
              </div>

              {/* Pricing & PV Ledger Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-2xs space-y-5">
                <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#006d36]" />
                  <span>Pricing, PV & Tax Structure</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* MRP */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">MRP Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="any"
                      value={mrp}
                      onChange={(e) => setMrp(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-[#006d36]/20 focus:border-[#006d36]"
                    />
                  </div>

                  {/* DP / Associate Price */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">DP / Selling Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="any"
                      value={dp}
                      onChange={(e) => setDp(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono font-bold text-[#006d36] focus:outline-hidden focus:ring-2 focus:ring-[#006d36]/20 focus:border-[#006d36]"
                    />
                  </div>

                  {/* PV Points */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Point Volume (PV) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="any"
                      value={pv}
                      onChange={(e) => setPv(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono font-bold text-purple-700 focus:outline-hidden focus:ring-2 focus:ring-[#006d36]/20 focus:border-[#006d36]"
                    />
                  </div>
                </div>

                {/* HSN & GST */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">HSN Code</label>
                    <input
                      type="text"
                      value={hsnCode}
                      onChange={(e) => handleHsnSelect(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-[#006d36]/20 focus:border-[#006d36]"
                      placeholder="e.g. 30049011, 21069099"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">GST Rate (%)</label>
                    <div className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-mono font-bold text-gray-700">
                      {hsnGst}% GST Applicable
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Image, Stock & Status */}
            <div className="space-y-6">
              {/* Product Image Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-2xs space-y-4">
                <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#006d36]" />
                  <span>Product Image</span>
                </h3>

                <div className="aspect-[3/4] rounded-2xl bg-gray-50/80 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center relative group p-3">
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl} alt={name} className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-center p-4">
                      <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <span className="text-xs text-gray-400 font-medium">Upload 3:4 Product Image</span>
                    </div>
                  )}

                  <label className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Upload className="w-6 h-6 mb-1" />
                    <span className="text-xs font-bold">Change Image</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500">Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono text-gray-600 focus:outline-hidden focus:ring-2 focus:ring-[#006d36]/20 focus:border-[#006d36]"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Stock & Availability Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-2xs space-y-4">
                <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#006d36]" />
                  <span>Inventory & Marketing Tag</span>
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-[#006d36]/20 focus:border-[#006d36]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Marketing Tag</label>
                  <select
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#006d36]/20 focus:border-[#006d36] bg-white"
                  >
                    <option value="Bestseller">Bestseller</option>
                    <option value="Popular">Popular</option>
                    <option value="New Launch">New Launch</option>
                    <option value="Special Offer">Special Offer</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">In Stock Available</span>
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="w-4 h-4 accent-[#006d36] rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-md flex items-center justify-between gap-4">
            <Link
              href="/admin/products"
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold transition-all"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="px-8 py-2.5 rounded-xl bg-[#006d36] hover:bg-[#005025] text-white text-xs font-bold shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Product Changes</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
