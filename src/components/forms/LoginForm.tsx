"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  Shield,
  Diamond,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  HelpCircle,
  X,
} from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: loginIdentifier.trim(),
          password: password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setErrorMessage(data.message || "Invalid member credentials.");
      }
    } catch {
      setErrorMessage("Network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md float-in">
      <div className="bg-white rounded-2xl p-8 sm:p-10 neo-shadow relative overflow-hidden border border-white/60">
        {/* Glass highlight edge */}
        <div className="absolute inset-0 border border-white/80 rounded-2xl pointer-events-none" />

        {/* Logo & Header */}
        <div className="text-center mb-6 flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/avira-logo.png"
            alt="Avira Lifecare Global Private Limited"
            className="h-16 w-auto object-contain mb-3"
          />
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#006d36] tracking-tight mb-1">
            Associate Login
          </h1>
          <p className="text-xs text-[#5f5e5e]">
            Avira Lifecare Global Private Limited
          </p>
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
              <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#5f5e5e]/50 pointer-events-none" />
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
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs text-[#006d36] hover:text-[#50c878] transition-colors font-medium cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#5f5e5e]/50 pointer-events-none" />
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
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5f5e5e]/50 hover:text-[#006d36] transition-colors focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out z-0" />
            </button>
          </div>
        </form>

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-emerald-200 space-y-4 animate-scaleUp text-left">
              <div className="flex items-center justify-between pb-3 border-b border-[#e2e2e2]">
                <div className="flex items-center gap-2 text-[#006d36]">
                  <HelpCircle className="w-5 h-5" />
                  <h3 className="font-black text-base text-[#1a1c1c]">Password Assistance</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs text-[#3e4a3f] space-y-3 leading-relaxed">
                <p>
                  To reset your Avira Associate password or recover your account access:
                </p>
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-[#006d36] font-medium space-y-1">
                  <div className="font-bold">Contact Avira Central Desk:</div>
                  <div>📧 <strong>support@aviracare.com</strong></div>
                  <div>📞 <strong>+91 98765 43210</strong> (Mon - Sat, 10 AM - 6 PM)</div>
                </div>
                <p className="text-[11px] text-[#5f5e5e]">
                  Alternatively, please reach out to your direct active Sponsor for password assistance.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-2.5 rounded-xl bg-[#006d36] hover:bg-[#005025] text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        )}

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
