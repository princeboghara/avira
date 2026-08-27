"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ShieldCheck, AlertCircle, Lock, KeyRound } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!password.trim()) {
      setErrorMessage("Please enter the Master Administrator Password");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Invalid Master Password.");
        setIsLoading(false);
        return;
      }

      router.push("/admin/dashboard");
    } catch {
      setErrorMessage("Cannot reach authentication server. Please check your connection.");
      setIsLoading(false);
    }
  };

  const fillDefaultAdminPass = () => {
    setPassword("admin123");
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] flex flex-col justify-between p-6 relative font-sans selection:bg-[#50c878] selection:text-[#005025]">
      {/* Top Header */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#006d36] to-[#50c878] flex items-center justify-center text-white shadow-sm shadow-[#006d36]/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-[#006d36] block">
              AVIRA LIFE CARE GLOBAL
            </span>
            <span className="text-[10px] font-mono tracking-widest text-[#5f5e5e] uppercase font-bold">
              Master Admin Console
            </span>
          </div>
        </div>

        <Link
          href="/login"
          className="text-xs font-bold text-[#5f5e5e] hover:text-[#006d36] transition-colors flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-[#e2e2e2] shadow-xs"
        >
          <span className="material-symbols-outlined text-[16px]">person</span>
          <span>Switch to Member Portal</span>
        </Link>
      </header>

      {/* Center Console Card */}
      <main className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-[#e2e2e2] shadow-xl relative overflow-hidden">
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006d36] via-[#50c878] to-[#006d36]" />

          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#006d36] shadow-xs">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1a1c1c] tracking-tight">
              Admin Password Login
            </h1>
            <p className="text-xs text-[#5f5e5e] mt-1">
              Enter your master security password to access the control panel.
            </p>
          </div>

          {/* Quick 1-Click Demo Password Button */}
          <div className="mb-5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
            <div className="text-xs">
              <span className="text-[10px] text-[#5f5e5e] uppercase tracking-wider block font-bold">
                Default Master Password:
              </span>
              <span className="font-mono font-black text-[#006d36]">admin123</span>
            </div>
            <button
              type="button"
              onClick={fillDefaultAdminPass}
              className="px-3 py-1.5 bg-[#006d36] hover:bg-[#005025] text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Fill Pass</span>
            </button>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label
                htmlFor="adminPassword"
                className="block text-xs font-bold text-[#1a1c1c] mb-1.5 uppercase tracking-wider"
              >
                Master Administrator Password *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                </span>
                <input
                  id="adminPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter admin123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl py-3 pl-11 pr-11 text-[#1a1c1c] text-sm focus:border-[#006d36] focus:ring-1 focus:ring-[#006d36] outline-none transition-all placeholder-gray-400 font-medium tracking-wide"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-[#1a1c1c] transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 bg-[#006d36] hover:bg-[#005025] text-white rounded-xl font-bold text-sm shadow-md shadow-[#006d36]/20 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Unlocking Master Console...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Unlock Admin Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#e2e2e2] text-center">
            <p className="text-[11px] text-[#5f5e5e]">
              Are you an Associate Member?{" "}
              <Link href="/login" className="text-[#006d36] font-bold hover:underline ml-1">
                Go to Member Login
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full text-center text-[11px] text-[#5f5e5e] py-2">
        Avira Life Care Global • Secured with Supabase PostgreSQL • 256-Bit SSL
      </footer>
    </div>
  );
}
