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
    <div className="min-h-screen bg-[#07130c] text-white flex flex-col justify-between p-6 relative overflow-hidden font-sans selection:bg-[#50c878] selection:text-[#005025]">
      {/* Background glow decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-[#006d36]/25 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#50c878]/10 blur-[100px] pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#006d36] to-[#50c878] flex items-center justify-center text-white shadow-lg border border-[#50c878]/40">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-wider text-white block">
              AVIRA LIFE CARE GLOBAL
            </span>
            <span className="text-[10px] font-mono tracking-widest text-[#50c878] uppercase">
              Master Admin Console
            </span>
          </div>
        </div>

        <Link
          href="/login"
          className="text-xs font-semibold text-[#bdcabc] hover:text-[#50c878] transition-colors flex items-center gap-1.5 bg-white/5 px-3.5 py-2 rounded-xl border border-white/10"
        >
          <span className="material-symbols-outlined text-[16px]">person</span>
          <span>Switch to Member Portal</span>
        </Link>
      </header>

      {/* Center Console Card */}
      <main className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-md bg-[#0e1d14]/90 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 border border-[#006d36]/40 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#50c878] to-transparent" />

          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#006d36]/30 border border-[#50c878]/50 flex items-center justify-center text-[#50c878] shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Admin Password Login
            </h1>
            <p className="text-xs text-[#bdcabc] mt-1">
              Enter your master security password to access control panel.
            </p>
          </div>

          {/* Quick 1-Click Demo Password Button */}
          <div className="mb-5 p-3 rounded-xl bg-white/5 border border-[#50c878]/30 flex items-center justify-between">
            <div className="text-xs">
              <span className="text-[10px] text-[#bdcabc] uppercase tracking-wider block font-semibold">
                Default Master Password:
              </span>
              <span className="font-mono font-bold text-[#50c878]">admin123</span>
            </div>
            <button
              type="button"
              onClick={fillDefaultAdminPass}
              className="px-3 py-1.5 bg-[#006d36] hover:bg-[#005025] text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Fill Pass</span>
            </button>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label
                htmlFor="adminPassword"
                className="block text-xs font-bold text-[#bdcabc] mb-1.5 uppercase tracking-wider"
              >
                Master Administrator Password *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#bdcabc]/60">
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                </span>
                <input
                  id="adminPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter admin123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#050b07] border border-white/10 rounded-xl py-3 pl-11 pr-11 text-white text-sm focus:border-[#50c878] focus:ring-1 focus:ring-[#50c878] outline-none transition-all placeholder-white/20 font-medium tracking-wide"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#bdcabc]/60 hover:text-white transition-colors"
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
              className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-[#006d36] to-[#50c878] hover:from-[#005025] hover:to-[#006d36] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#006d36]/30 hover:scale-[1.01] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
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

          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <p className="text-[11px] text-[#bdcabc]">
              Are you an Associate Member?{" "}
              <Link href="/login" className="text-[#50c878] font-bold hover:underline ml-1">
                Go to Member Login
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full text-center text-[11px] text-[#bdcabc]/60 py-2">
        Avira Life Care Global • Secured with Supabase PostgreSQL
      </footer>
    </div>
  );
}
