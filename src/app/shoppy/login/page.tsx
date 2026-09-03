"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Store,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Package,
  Boxes,
  Truck,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function ShoppyLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError("Please enter your Shoppy ID / Mobile and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/shoppy/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (data.success) {
        window.location.href = "/shoppy/dashboard";
      } else {
        setError(data.message || "Invalid credentials. Please verify and try again.");
      }
    } catch {
      setError("Unable to connect to server. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setIdentifier("AVS01");
    setPassword("123456");
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#e6ecf2] flex flex-col justify-between p-4 sm:p-6 lg:p-8 text-slate-800 relative selection:bg-[#006d36] selection:text-white">
      {/* Top Header */}
      <header className="flex items-center justify-between max-w-5xl w-full mx-auto relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#007a3d] to-[#004d25] flex items-center justify-center text-white font-black shadow-[5px_5px_12px_#c2ccd6,-4px_-4px_10px_#ffffff]">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-slate-900">
              Avira LifeCare
            </h1>
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#006d36] font-black">
              SURAT PARCEL HUB • AVS01
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/login"
            className="shoppy-btn px-3.5 py-2 rounded-xl text-slate-700 hover:text-[#006d36] font-bold"
          >
            Member Portal
          </Link>
          <Link
            href="/admin/login"
            className="shoppy-btn px-3.5 py-2 rounded-xl text-slate-700 hover:text-[#006d36] font-bold"
          >
            Admin
          </Link>
        </div>
      </header>

      {/* Center Neumorphic Login Box */}
      <main className="max-w-md w-full mx-auto my-8 relative z-10">
        <div className="shoppy-surface-lg rounded-3xl p-6 sm:p-9 space-y-6 border border-white/80">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#007a3d] to-[#004d25] flex items-center justify-center text-white mx-auto shadow-[6px_6px_14px_rgba(0,109,54,0.35),-4px_-4px_10px_#ffffff]">
              <Store className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 pt-1">
              SURAT PARCEL HUB
            </h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Central logistics & dispatch fulfillment center login.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full shoppy-inset-sm font-mono text-[11px] font-black text-[#006d36]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official Hub ID: AVS01</span>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Shoppy ID or Mobile */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black font-mono text-slate-700 uppercase tracking-wider">
                Shoppy ID or Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. AVS01"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl shoppy-inset text-slate-900 placeholder-slate-400 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#006d36]/30 transition-all font-mono"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black font-mono text-slate-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter hub password"
                  className="w-full pl-10 pr-10 py-3 rounded-2xl shoppy-inset text-slate-900 placeholder-slate-400 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#006d36]/30 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* One-click Demo Credentials Helper */}
            <button
              type="button"
              onClick={handleQuickFill}
              className="w-full py-2 px-3 rounded-xl shoppy-surface-sm text-xs font-mono font-bold text-[#006d36] hover:text-[#005025] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Fill Credentials: AVS01 / 123456</span>
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl shoppy-btn-primary font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Entering Hub...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Surat Hub</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Help / Info */}
          <div className="pt-4 border-t border-white/70 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-[#006d36]" />
            <span>Authorized Fulfillment Center • Avira LifeCare</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 relative z-10 font-mono">
        <p>© 2026 Avira LifeCare Global. SURAT PARCEL HUB.</p>
      </footer>
    </div>
  );
}
