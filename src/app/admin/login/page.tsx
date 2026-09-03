"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ShieldCheck, AlertCircle, Lock, User, Eye, EyeOff } from "lucide-react";

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

      window.location.href = "/admin/dashboard";
    } catch {
      setErrorMessage("Network error connecting to operations server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bio-canvas-bg text-[#0f172a] flex flex-col justify-between p-4 sm:p-6 selection:bg-[#006d36] selection:text-white">
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
            <span className="font-heading font-extrabold text-sm tracking-tight text-[#006d36] block">
              AVIRA LIFECARE
            </span>
            <span className="text-[9px] font-mono tracking-widest text-[#64748b] uppercase font-bold">
              Master Admin Console
            </span>
          </div>
        </div>

        <Link
          href="/login"
          className="neo-btn-secondary text-xs font-bold text-[#64748b] hover:text-[#006d36] flex items-center gap-1.5 px-4 py-2 rounded-2xl"
        >
          <User className="w-4 h-4" />
          <span>Switch to Member Portal</span>
        </Link>
      </header>

      {/* Center Console Card */}
      <main className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-md glass-card rounded-[38px] sm:rounded-[42px] p-8 sm:p-10 shadow-[0_20px_50px_rgba(15,23,42,0.06)] relative overflow-hidden text-center">
          
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006d36] via-[#50c878] to-[#006d36]" />

          <div className="text-center mb-6 flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/avira-logo.png"
              alt="Avira Lifecare Global Private Limited"
              className="h-16 w-auto object-contain mb-3 drop-shadow-sm transition-transform hover:scale-105 duration-300"
            />
            <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#0f172a] tracking-tight">
              Admin Password Login
            </h1>
            <p className="text-xs text-[#64748b] mt-1 font-medium">
              Avira Lifecare Global Private Limited
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs flex items-center gap-2.5 text-left font-semibold animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div>
              <label
                htmlFor="adminPassword"
                className="block text-[11px] font-bold text-[#475569] mb-1.5 uppercase tracking-wider pl-1"
              >
                Master Administrator Password *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#94a3b8]">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="adminPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter master password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="neo-input w-full rounded-2xl py-3 pl-11 pr-11 text-[#0f172a] text-sm font-medium tracking-wide"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#94a3b8] hover:text-[#0f172a] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="neo-btn-primary w-full mt-2 py-3.5 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
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

          <div className="mt-6 pt-4 border-t border-gray-200/60 text-center">
            <p className="text-xs text-[#64748b] font-medium">
              Are you an Associate Member?{" "}
              <Link href="/login" className="text-[#006d36] font-bold hover:underline ml-1">
                Go to Member Login
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full text-center text-xs text-[#64748b] py-2">
        Avira Life Care Global • Secured Management Console • 256-Bit SSL
      </footer>
    </div>
  );
}
