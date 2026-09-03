"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Truck,
  Package,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  Percent,
  Sliders,
  Sparkles,
  RefreshCw,
  Zap,
  Lock,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

interface GlobalShippingSettings {
  defaultShippingCharge: number;
  freeShippingThreshold: number;
  enableFreeShipping: boolean;
  updatedAt?: string;
}

interface ProductShippingItem {
  id: number;
  name: string;
  categoryName: string;
  mrp: number;
  discountPrice: number | null;
  pv: number;
  shippingCharge: number;
  isFreeShipping: boolean;
  inStock: boolean;
  imageUrl?: string;
}

export default function ShippingChargeMasterPage() {
  const [globalSettings, setGlobalSettings] = useState<GlobalShippingSettings>({
    defaultShippingCharge: 50,
    freeShippingThreshold: 999,
    enableFreeShipping: false,
  });

  const [products, setProducts] = useState<ProductShippingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [savingProductId, setSavingProductId] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const res = await fetch("/api/admin/shipping");
      const data = await res.json();
      if (data.success) {
        if (data.globalSettings) setGlobalSettings(data.globalSettings);
        if (data.products) setProducts(data.products);
      } else {
        setErrorMessage(data.message || "Failed to load shipping settings.");
      }
    } catch {
      setErrorMessage("Network error fetching shipping data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveGlobal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGlobal(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_GLOBAL",
          ...globalSettings,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(data.message || `Default shipping charge of ₹${globalSettings.defaultShippingCharge} applied to all products and member cart!`);
        // Immediately sync all local products
        setProducts((prev) =>
          prev.map((p) => ({ ...p, shippingCharge: globalSettings.defaultShippingCharge }))
        );
      } else {
        setErrorMessage(data.message || "Failed to save global settings.");
      }
    } catch {
      setErrorMessage("Network error while saving settings.");
    } finally {
      setSavingGlobal(false);
    }
  };

  const handleSaveProduct = async (product: ProductShippingItem) => {
    setSavingProductId(product.id);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_PRODUCT",
          productId: product.id,
          shippingCharge: product.shippingCharge,
          isFreeShipping: product.isFreeShipping,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`✓ Saved shipping settings for "${product.name}"`);
      } else {
        setErrorMessage(data.message || "Failed to update product shipping.");
      }
    } catch {
      setErrorMessage("Network error while updating product shipping.");
    } finally {
      setSavingProductId(null);
    }
  };

  const updateLocalProduct = (id: number, field: keyof ProductShippingItem, val: any) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    );
  };

  // Distinct Categories for filter
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.categoryName) set.add(p.categoryName);
    });
    return Array.from(set);
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(p.id).includes(searchQuery);
      const matchesCategory =
        categoryFilter === "ALL" || p.categoryName === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  return (
    <AdminLayout onRefresh={fetchData} refreshing={loading}>
      <div className="space-y-6 max-w-7xl mx-auto pb-16 font-[Arial,sans-serif]">
        {/* Neumorphic Header Card */}
        <div className="neo-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-white/80">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full neo-inset text-[#006d36] text-xs font-bold font-mono border border-emerald-200/50">
              <Truck className="w-4 h-4" />
              <span>Logistics & Fulfilment Master</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0f172a] tracking-tight">
              Shipping Charge Master
            </h1>
            <p className="text-xs sm:text-sm text-[#64748b] max-w-xl font-medium">
              Manage nationwide delivery charges, free delivery minimum thresholds, and individual product shipping surcharges or free shipping flags.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="neo-btn px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-bold text-[#1a1c1c] cursor-pointer hover:text-[#006d36]"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Roster</span>
          </button>
        </div>

        {/* Alerts */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-[#006d36] text-xs font-bold flex items-center gap-2 shadow-2xs animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 shadow-2xs animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Global Delivery Settings Card */}
        <div className="rounded-3xl p-6 sm:p-8 bg-white border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#006d36] flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1a1c1c]">
                  Global Storewide Delivery Rules
                </h2>
                <p className="text-xs text-gray-500">
                  Standard delivery parameters applied across member store checkouts.
                </p>
              </div>
            </div>
            {globalSettings.updatedAt && (
              <span className="text-[10px] font-mono text-gray-400">
                Updated: {new Date(globalSettings.updatedAt).toLocaleDateString("en-IN")}
              </span>
            )}
          </div>

          <form onSubmit={handleSaveGlobal} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Default Shipping Charge */}
              <div className="p-5 rounded-2xl bg-emerald-50/60 border-2 border-[#006d36]/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Default Storewide Shipping Fee:
                  </label>
                  <span className="text-[10px] font-mono font-bold bg-emerald-100 text-[#006d36] px-2 py-0.5 rounded-full border border-emerald-300">
                    APPLIES TO ALL PRODUCTS & CART
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#006d36] font-mono font-bold text-base">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={globalSettings.defaultShippingCharge}
                    onChange={(e) =>
                      setGlobalSettings((prev) => ({
                        ...prev,
                        defaultShippingCharge: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full bg-white border border-emerald-300 rounded-xl py-2.5 pl-9 pr-4 font-mono font-black text-base text-[#1a1c1c] outline-hidden focus:border-[#006d36] shadow-2xs"
                    required
                  />
                </div>
                <span className="text-[11px] text-gray-600 block leading-tight">
                  This exact shipping charge will automatically apply to every product and be calculated in member cart checkout.
                </span>
              </div>

              {/* Free Shipping Minimum Threshold - LOCKED */}
              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-300 space-y-2.5 opacity-85 select-none">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Free Delivery Threshold</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md border border-amber-300">
                    LOCKED / INACTIVE
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-700 font-mono font-bold text-base">
                    ₹
                  </span>
                  <input
                    type="number"
                    disabled
                    value={globalSettings.freeShippingThreshold}
                    className="w-full bg-amber-100/60 border border-amber-300 rounded-xl py-2.5 pl-9 pr-4 font-mono font-black text-base text-amber-800 cursor-not-allowed outline-hidden"
                  />
                </div>
                <span className="text-[11px] text-amber-800 block leading-tight">
                  Free delivery threshold is currently locked and will not be applied. All orders use the default shipping fee.
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={savingGlobal}
                className="px-8 py-3.5 rounded-2xl bg-[#006d36] hover:bg-[#005025] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer disabled:opacity-60"
              >
                {savingGlobal ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{savingGlobal ? "Applying Everywhere..." : "Save & Apply to All Products"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Individual Product Shipping Surcharge Table */}
        <div className="rounded-3xl p-6 sm:p-8 bg-white border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1a1c1c]">
                  Product Shipping Surcharges & Free Delivery Exceptions
                </h2>
                <p className="text-xs text-gray-500">
                  Assign custom shipping charges to individual products or mark heavy/fragile items.
                </p>
              </div>
            </div>

            {/* Filter & Search */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-60">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-9 pr-3 text-xs outline-hidden focus:border-[#006d36]"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs font-medium text-gray-700 outline-hidden focus:border-[#006d36] cursor-pointer"
              >
                <option value="ALL">All Categories ({products.length})</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Sr No</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Price</th>
                  <th className="py-3 px-4 text-center">PV</th>
                  <th className="py-3 px-4 text-center">Free Delivery?</th>
                  <th className="py-3 px-4 text-center">Custom Shipping Charge (₹)</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-[#1a1c1c]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#006d36]">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <span>Loading products roster...</span>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-gray-400">
                      No products found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p, idx) => {
                    const price = p.discountPrice || p.mrp;
                    const isSavingThis = savingProductId === p.id;

                    return (
                      <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                        {/* 1. Sr No */}
                        <td className="py-3 px-4 font-mono font-bold text-gray-500">
                          {idx + 1}
                        </td>

                        {/* 2. Product Name */}
                        <td className="py-3 px-4">
                          <span className="font-bold text-xs text-[#1a1c1c] block">
                            {p.name}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            ID: #{p.id}
                          </span>
                        </td>

                        {/* 3. Category */}
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                            {p.categoryName || "General"}
                          </span>
                        </td>

                        {/* 4. Price */}
                        <td className="py-3 px-4 text-right font-mono font-black text-xs text-[#1a1c1c]">
                          ₹{price.toLocaleString("en-IN")}
                        </td>

                        {/* 5. PV */}
                        <td className="py-3 px-4 text-center font-mono font-bold text-xs text-[#006d36]">
                          {p.pv} PV
                        </td>

                        {/* 6. Free Shipping Toggle */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              updateLocalProduct(p.id, "isFreeShipping", !p.isFreeShipping)
                            }
                            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer border ${
                              p.isFreeShipping
                                ? "bg-emerald-100 text-[#006d36] border-emerald-300 shadow-2xs"
                                : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                            }`}
                          >
                            {p.isFreeShipping ? "✓ Free Delivery" : "Standard Rules"}
                          </button>
                        </td>

                        {/* 7. Custom Shipping Surcharge */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1">
                            <span className="text-gray-400 font-mono font-bold text-xs">₹</span>
                            <input
                              type="number"
                              min="0"
                              step="5"
                              disabled={p.isFreeShipping}
                              value={p.isFreeShipping ? 0 : p.shippingCharge}
                              onChange={(e) =>
                                updateLocalProduct(
                                  p.id,
                                  "shippingCharge",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-20 bg-white border border-gray-200 rounded-lg py-1 px-2 text-center font-mono font-bold text-xs outline-hidden focus:border-[#006d36] disabled:bg-gray-100 disabled:text-gray-400"
                            />
                          </div>
                        </td>

                        {/* 8. Action */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleSaveProduct(p)}
                            disabled={isSavingThis}
                            className="px-3.5 py-1 rounded-xl bg-[#006d36] hover:bg-[#005025] text-white text-xs font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-60 inline-flex items-center gap-1.5"
                          >
                            {isSavingThis ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Save className="w-3 h-3" />
                            )}
                            <span>{isSavingThis ? "Saving..." : "Save"}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
