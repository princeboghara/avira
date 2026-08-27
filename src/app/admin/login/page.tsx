"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ShieldCheck, AlertCircle, Lock, KeyRound, User, Eye, EyeOff } from "lucide-react";

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
        setErrorMessage(data.message || "Invalid master administrator credentials.");
        setIsLoading(false);
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setErrorMessage("Network error connecting to operations server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] flex flex-col justify-between p-4 sm:p-6 selection:bg-[#50c878] selection:text-[#005025]">
      {/* Top Header Navigation */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/avira-logo.png"
            alt="Avira Lifecare Global Private Limited"
            className="h-10 sm:h-12 w-auto object-contain"
          />
          <div>
            <span className="font-black text-sm tracking-tight text-[#006d36] block">
              AVIRA LIFECARE
            </span>
            <span className="text-[9px] font-mono tracking-widest text-[#5f5e5e] uppercase font-bold">
              Master Admin Console
            </span>
          </div>
        </div>

        <Link
          href="/login"
          className="text-xs font-bold text-[#5f5e5e] hover:text-[#006d36] transition-colors flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-[#e2e2e2] shadow-xs"
        >
          <User className="w-4 h-4" />
          <span>Switch to Member Portal</span>
        </Link>
      </header>

      {/* Center Console Card */}
      <main className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-[#e2e2e2] shadow-xl relative overflow-hidden">
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006d36] via-[#50c878] to-[#006d36]" />

          <div className="text-center mb-6 flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/avira-logo.png"
              alt="Avira Lifecare Global Private Limited"
              className="h-16 w-auto object-contain mb-3"
            />
            <h1 className="text-xl sm:text-2xl font-black text-[#1a1c1c] tracking-tight">
              Admin Password Login
            </h1>
            <p className="text-xs text-[#5f5e5e] mt-1">
              Avira Lifecare Global Private Limited
            </p>
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
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="adminPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter master password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl py-3 pl-11 pr-11 text-[#1a1c1c] text-sm focus:border-[#006d36] focus:ring-1 focus:ring-[#006d36] outline-none transition-all placeholder-gray-400 font-medium tracking-wide"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-[#1a1c1c] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
        Avira Life Care Global • Secured Management Console • 256-Bit SSL
      </footer>
    </div>
  );
}
