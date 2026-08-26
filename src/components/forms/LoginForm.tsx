"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Zap, AlertCircle, Shield } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!loginIdentifier.trim()) {
      setErrorMessage("Please enter your Member ID (e.g. AV23900) or Registered Mobile");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginIdentifier: loginIdentifier.trim().toUpperCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Invalid credentials. Please try again.");
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setErrorMessage("Unable to connect to authentication server. Please check your connection.");
      setIsLoading(false);
    }
  };

  const fillDemoRoot = () => {
    setLoginIdentifier("AV00001");
    setPassword("admin123");
    setErrorMessage("");
  };

  return (
    <div className="w-full max-w-md float-in">
      <div className="bg-white rounded-2xl p-8 sm:p-10 neo-shadow relative overflow-hidden border border-white/60">
        {/* Glass highlight edge */}
        <div className="absolute inset-0 border border-white/80 rounded-2xl pointer-events-none" />

        {/* Logo & Header */}
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="w-16 h-16 mb-4 rounded-2xl bg-gradient-to-tr from-[#006d36] to-[#50c878] flex items-center justify-center text-white neo-shadow shadow-md">
            <span className="material-symbols-outlined text-[32px]">diamond</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#006d36] tracking-tight mb-1">
            Associate Login
          </h1>
          <p className="text-xs sm:text-sm text-[#5f5e5e]">
            Access your Avira Life Care Global associate dashboard.
          </p>
        </div>

        {/* Fast 1-Click Demo Testing for Network Members */}
        <div className="mb-6 p-3 rounded-xl bg-[#eeeeee]/60 border border-[#e2e2e2]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#006d36] mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Root Associate Account:</span>
          </div>
          <button
            type="button"
            onClick={fillDemoRoot}
            className="w-full px-3 py-2 text-xs font-bold bg-white hover:bg-emerald-50 border border-emerald-200 text-[#006d36] rounded-xl transition-all text-left shadow-sm cursor-pointer flex items-center justify-between"
          >
            <div>
              <div className="font-mono font-black text-sm">AV00001</div>
              <div className="text-[10px] text-[#5f5e5e]">Avira Life Care Global</div>
            </div>
            <span className="text-[10px] font-mono bg-emerald-100 text-[#006d36] px-2 py-0.5 rounded-md font-bold">
              Fill AV00001
            </span>
          </button>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="loginIdentifier"
              className="text-xs text-[#3e4a3f] block ml-1 uppercase tracking-wider font-bold"
            >
              Member ID (Only) *
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#5f5e5e]/50 select-none text-[20px]">
                badge
              </span>
              <input
                id="loginIdentifier"
                name="loginIdentifier"
                type="text"
                autoComplete="username"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value.toUpperCase())}
                placeholder="e.g. AV00001"
                required
                className="w-full pl-12 pr-4 py-3 bg-[#f9f9f9] border-none rounded-xl neo-inset text-[#1a1c1c] focus:ring-2 focus:ring-[#006d36] transition-all text-sm font-mono font-bold tracking-wider placeholder-[#5f5e5e]/40 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor="password"
                className="text-xs text-[#3e4a3f] block ml-1 uppercase tracking-wider font-bold"
              >
                Password
              </label>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Demo Member Password is: member123");
                }}
                className="text-xs text-[#006d36] hover:text-[#50c878] transition-colors font-medium"
              >
                Forgot Password?
              </a>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#5f5e5e]/50 select-none text-[20px]">
                lock
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-12 pr-12 py-3 bg-[#f9f9f9] border-none rounded-xl neo-inset text-[#1a1c1c] focus:ring-2 focus:ring-[#50c878]/50 transition-all text-sm font-semibold placeholder-[#5f5e5e]/40 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5f5e5e]/50 hover:text-[#006d36] transition-colors focus:outline-none"
              >
                <span className="material-symbols-outlined text-[20px] select-none">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-[#6e7a6e] text-[#006d36] focus:ring-[#50c878] neo-inset bg-[#f9f9f9] cursor-pointer"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-xs text-[#3e4a3f] cursor-pointer font-medium"
            >
              Remember me on this device
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 bg-[#006d36] hover:bg-[#005025] text-white rounded-xl font-bold text-base shadow-[0_8px_16px_rgba(0,109,54,0.25)] hover:shadow-[0_12px_20px_rgba(0,109,54,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 relative overflow-hidden group cursor-pointer disabled:opacity-70"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing into Associate Dashboard...</span>
                  </>
                ) : (
                  <>
                    <span>Login to Dashboard</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out z-0" />
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-[#5f5e5e]">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-bold text-[#006d36] hover:text-[#50c878] transition-colors ml-1"
            >
              Register Now
            </Link>
          </p>
        </div>

        {/* Clear Separation: Link to Dedicated Admin Portal */}
        <div className="mt-6 pt-4 border-t border-[#e2e2e2] text-center">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 text-xs text-[#5f5e5e] hover:text-[#006d36] font-semibold transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-[#006d36]" />
            <span>Master Administrator? Access Admin Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
