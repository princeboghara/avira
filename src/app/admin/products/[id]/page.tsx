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
  Calculator,
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
  const [discountPrice, setDiscountPrice] = useState<number | "">("");
  const [pv, setPv] = useState<number>(0);
  const [stock, setStock] = useState<number>(500);
  const [inStock, setInStock] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("Popular");
  const [showSavedToast, setShowSavedToast] = useState(false);

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

        let loadedHsnList: Array<{ id: string; hsnCode: string; sgst: number; cgst: number; description?: string }> = [];
        if (hsnRes.status === "fulfilled") {
          const hsnData = await hsnRes.value.json();
          if (hsnData.success && hsnData.hsnCodes) {
            loadedHsnList = hsnData.hsnCodes;
            setHsnCodes(hsnData.hsnCodes);
          }
        }

        if (prodRes.status === "fulfilled") {
          const prodData = await prodRes.value.json();
          if (prodData.success && prodData.product) {
            const p = prodData.product;
            setName(p.name || "");
            setCategory(p.category || "");
            setNetQuantity(p.netQuantity || "1 Unit");
            setHsnCode(p.hsnCode || "");
            let calculatedGst = p.hsnGst || 0;
            if (p.hsnCode && loadedHsnList.length > 0) {
              const foundHsn = loadedHsnList.find((h) => h.hsnCode === p.hsnCode);
              if (foundHsn) calculatedGst = Number(foundHsn.sgst) + Number(foundHsn.cgst);
            }
            setHsnGst(calculatedGst);
            setMrp(p.mrp || 0);
            setDiscountPrice(p.discountPrice && p.discountPrice < p.mrp ? p.discountPrice : "");
            setPv(p.pv || 0);
            setStock(p.stock !== undefined ? p.stock : 500);
            setInStock(p.inStock !== false);
            setImageUrl(p.imageUrl || "");
            setDescription(p.description || "");
            setTag(p.tag || "Popular");
          }
        }
      } catch (err) {
        console.error("Error loading product:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProductData();
  }, [productId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleHsnSelect = (code: string) => {
    setHsnCode(code);
    const found = hsnCodes.find((h) => h.hsnCode === code);
    if (found) {
      setHsnGst(Number(found.sgst) + Number(found.cgst));
    } else {
      setHsnGst(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const finalDiscount = typeof discountPrice === "number" && discountPrice > 0 ? discountPrice : mrp;
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          category,
          hsnCode,
          netQuantity,
          mrp,
          dp: finalDiscount,
          discountPrice: finalDiscount,
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
        setShowSavedToast(true);
        setTimeout(() => setShowSavedToast(false), 3500);
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
              <span className="text-[10px] text-emerald-300 block uppercase font-bold">Price</span>
              <span className="text-2xl font-black font-mono">
                ₹{(typeof discountPrice === "number" && discountPrice > 0 ? discountPrice : mrp).toLocaleString("en-IN")}
              </span>
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
                      <option value="">-- Select Category --</option>
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

                  {/* Discount Price */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Discount Price (₹) <span className="text-gray-400 font-normal">(Optional)</span></label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Leave blank for no discount"
                      value={discountPrice}
                      onChange={(e) => setDiscountPrice(e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono font-bold text-[#006d36] focus:outline-hidden focus:ring-2 focus:ring-[#006d36]/20 focus:border-[#006d36]"
                    />
                    <span className="text-[10px] text-gray-500 block leading-tight">If entered, product sells at this price. If empty, regular MRP applies.</span>
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

                {/* HSN & GST Dropdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">HSN Code (Select Dropdown) *</label>
                    <select
                      value={hsnCode}
                      onChange={(e) => handleHsnSelect(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-[#006d36]/20 focus:border-[#006d36] bg-white cursor-pointer"
                    >
                      <option value="">-- Select HSN Code --</option>
                      {hsnCodes.map((h) => (
                        <option key={h.id} value={h.hsnCode}>
                          HSN: {h.hsnCode} — {Number(h.sgst) + Number(h.cgst)}% GST ({h.description || "General"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">GST Rate (%)</label>
                    <div className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-mono font-bold text-gray-700">
                      {hsnGst}% GST Applicable
                    </div>
                  </div>
                </div>

                {/* Live GST Tax Breakdown Strip */}
                {(() => {
                  const effectiveSellingPrice = discountPrice !== "" && Number(discountPrice) > 0 ? Number(discountPrice) : Number(mrp || 0);
                  const effectiveGstRate = Number(hsnGst || 0);
                  const baseRateWithoutGst = effectiveGstRate > 0
                    ? Number((effectiveSellingPrice / (1 + effectiveGstRate / 100)).toFixed(2))
                    : effectiveSellingPrice;
                  const gstAmount = Number((effectiveSellingPrice - baseRateWithoutGst).toFixed(2));
                  const cgstAmount = Number((gstAmount / 2).toFixed(2));
                  const sgstAmount = Number((gstAmount - cgstAmount).toFixed(2));

                  return (
                    <div className="mt-5 p-5 rounded-3xl bg-[#edf2f0] border border-white/80 shadow-[8px_8px_18px_#d1dad5,-8px_-8px_18px_#ffffff] space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-300/60 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#edf2f0] shadow-[inset_2px_2px_5px_#d1dad5,inset_-2px_-2px_5px_#ffffff] flex items-center justify-center text-[#006d36]">
                            <Calculator className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-black text-gray-800 uppercase tracking-wider block">
                              GST Tax Breakdown
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium">
                              Live Neumorphic Inclusive Tax Calculator
                            </span>
                          </div>
                        </div>
                        {hsnCode ? (
                          <span className="px-3 py-1 rounded-xl bg-[#edf2f0] text-emerald-800 text-[11px] font-mono font-bold shadow-[3px_3px_8px_#d1dad5,-3px_-3px_8px_#ffffff] border border-white/60">
                            HSN: {hsnCode} • {effectiveGstRate}% GST
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-amber-700 bg-[#edf2f0] px-3 py-1 rounded-xl shadow-[inset_2px_2px_4px_#d1dad5,inset_-2px_-2px_4px_#ffffff]">
                            Select an HSN Code to calculate GST
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        {/* 1. Base Price Without GST */}
                        <div className="bg-[#edf2f0] rounded-2xl p-4 shadow-[inset_3px_3px_7px_#d1dad5,inset_-3px_-3px_7px_#ffffff] border border-white/60 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block">
                              GST વગર રકમ (Base Rate)
                            </span>
                            <div className="text-lg sm:text-xl font-black font-mono text-gray-900 mt-1">
                              ₹{baseRateWithoutGst.toFixed(2)}
                            </div>
                          </div>
                          <span className="text-[10px] text-gray-500 font-medium mt-1.5 block">
                            Taxable value before {effectiveGstRate}% GST
                          </span>
                        </div>

                        {/* 2. Total GST Amount */}
                        <div className="bg-[#edf2f0] rounded-2xl p-4 shadow-[inset_3px_3px_7px_#d1dad5,inset_-3px_-3px_7px_#ffffff] border border-white/60 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">
                                GST રકમ ({effectiveGstRate}%)
                              </span>
                              {effectiveGstRate > 0 && (
                                <span className="text-[9px] font-mono font-bold text-emerald-700 px-2 py-0.5 rounded-lg bg-[#edf2f0] shadow-[2px_2px_5px_#d1dad5,-2px_-2px_5px_#ffffff]">
                                  {(effectiveGstRate / 2).toFixed(1)}% + {(effectiveGstRate / 2).toFixed(1)}%
                                </span>
                              )}
                            </div>
                            <div className="text-lg sm:text-xl font-black font-mono text-emerald-700 mt-1">
                              ₹{gstAmount.toFixed(2)}
                            </div>
                          </div>
                          {effectiveGstRate > 0 ? (
                            <div className="text-[10px] text-gray-600 font-mono mt-1.5 pt-1.5 border-t border-gray-300/50 flex items-center justify-between">
                              <span>CGST: ₹{cgstAmount.toFixed(2)}</span>
                              <span>•</span>
                              <span>SGST: ₹{sgstAmount.toFixed(2)}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-500 mt-1.5 block">0% GST applied</span>
                          )}
                        </div>

                        {/* 3. Final Selling Price */}
                        <div className="bg-gradient-to-br from-[#022814] via-[#04331b] to-[#01170b] text-white rounded-2xl p-4 shadow-[6px_6px_16px_rgba(2,40,20,0.35),-4px_-4px_12px_#ffffff] border border-emerald-500/20 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
                              Final Selling Price (Inc. GST)
                            </span>
                            <div className="text-lg sm:text-xl font-black font-mono text-white mt-1">
                              ₹{effectiveSellingPrice.toFixed(2)}
                            </div>
                          </div>
                          <span className="text-[10px] text-emerald-200/80 mt-1.5 block">
                            {discountPrice !== "" && Number(discountPrice) > 0 ? "Discounted Price" : "Standard MRP"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
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
                  <span>Inventory & Store Status</span>
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

                {/* Live vs Retired Selector */}
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <label className="text-xs font-bold text-gray-700 block">Product Status (Store Visibility)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setInStock(true)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        inStock ? "bg-[#006d36] text-white shadow-xs" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-300" />
                      <span>Live</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInStock(false)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        !inStock ? "bg-slate-800 text-white shadow-xs" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      <span>Retired</span>
                    </button>
                  </div>
                  <span className="text-[10px] text-gray-500 block leading-tight">
                    {inStock ? "✓ Live: Product shows on Member Shopping Store." : "✕ Retired: Product hidden from Member Store."}
                  </span>
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

        {/* ON-SCREEN "DATA SAVED" SIGN/NOTIFICATION */}
        {showSavedToast && (
          <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 animate-bounce shadow-2xl">
            <div className="px-6 py-3.5 rounded-2xl bg-[#006d36] text-white flex items-center gap-3 border border-emerald-400">
              <CheckCircle2 className="w-6 h-6 text-emerald-200" />
              <div>
                <h4 className="text-sm font-black tracking-wide uppercase">Data Saved</h4>
                <p className="text-[11px] text-emerald-100 font-medium">Product changes updated in system catalog.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
