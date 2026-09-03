"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Loader2,
  AlertCircle,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  HelpCircle,
  X,
  UserPlus,
  ShieldCheck,
} from "lucide-react";

export default function LoginForm() {
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Strictly enforce Member ID formatting: uppercase AV + up to 5 digits (Total max 7 chars: AV00001)
  const handleMemberIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    
    // Auto-prefix AV if user starts typing numbers directly
    if (val.length > 0 && !val.startsWith("A") && !val.startsWith("AV")) {
      val = "AV" + val;
    }
    
    // Limit to max 7 characters
    if (val.length > 7) {
      val = val.slice(0, 7);
    }
    
    setLoginIdentifier(val);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    const cleanMemberId = loginIdentifier.trim().toUpperCase();

    if (!cleanMemberId) {
      setErrorMessage("Please enter your Member ID");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: cleanMemberId,
          password: password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        window.location.href = "/dashboard";
      } else {
        setErrorMessage(data.message || "Invalid member credentials.");
        setIsLoading(false);
      }
    } catch {
      setErrorMessage("Network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center py-4 sm:py-8">
      {/* Neumorphic Glass Card Container */}
      <div className="relative w-full max-w-[94vw] sm:max-w-[440px] lg:max-w-[460px] rounded-[36px] sm:rounded-[40px] glass-card p-7 sm:p-9 flex flex-col items-center justify-center text-center shadow-[0_20px_50px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.02)] transition-all duration-300">
        
        {/* Soft Ambient Inner Highlight */}
        <div className="absolute inset-0 rounded-[36px] sm:rounded-[40px] bg-gradient-to-b from-white/60 via-transparent to-emerald-500/5 pointer-events-none" />

        {/* Content Container */}
        <div className="relative z-10 w-full flex flex-col items-center justify-center space-y-4 my-auto">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/avira-logo.png"
              alt="Avira Life Care"
              className="h-16 sm:h-20 w-auto object-contain mb-2.5 drop-shadow-sm transition-transform hover:scale-105 duration-300"
            />
            <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#0f172a] tracking-tight leading-tight">
              Associate Sign In
            </h1>
            <p className="text-[11px] sm:text-xs text-[#64748b] font-medium mt-0.5">
              Avira Life Care Global Private Limited
            </p>
          </div>

          {errorMessage && (
            <div className="w-full p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs flex items-center gap-2.5 text-left font-semibold animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleLogin} className="w-full space-y-3.5 pt-1">
            
            {/* Member ID Input */}
            <div className="relative w-full text-left">
              <label htmlFor="loginIdentifier" className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1 pl-1">
                Member ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
                <input
                  id="loginIdentifier"
                  name="loginIdentifier"
                  type="text"
                  maxLength={7}
                  autoComplete="username"
                  value={loginIdentifier}
                  onChange={handleMemberIdChange}
                  placeholder="e.g. AV00001"
                  required
                  className="neo-input w-full pl-11 pr-4 py-3 rounded-2xl text-xs sm:text-sm font-bold tracking-wider placeholder-[#94a3b8] text-left uppercase"
                />
              </div>
            </div>

            {/* Password Input with Eye Toggle */}
            <div className="relative w-full text-left">
              <label htmlFor="password" className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1 pl-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none z-10" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="neo-input w-full pl-11 pr-12 py-3 rounded-2xl text-xs sm:text-sm font-semibold placeholder-[#94a3b8] text-left relative z-0"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#0f172a] transition-colors focus:outline-none cursor-pointer z-20 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-center justify-end px-1 text-xs">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[#64748b] hover:text-[#006d36] transition-colors font-semibold cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            {/* Tactile Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="neo-btn-primary w-full py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in & Opening Dashboard...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* New Registration Button Section */}
          <div className="pt-4 mt-2 border-t border-gray-200/60 w-full flex flex-col items-center gap-2.5">
            <p className="text-xs text-[#64748b] font-medium">
              New to Avira Life Care Global?
            </p>
            <Link
              href="/register"
              className="neo-btn-secondary w-full py-3 px-5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-[#006d36]" />
              <span>Create New Associate Account</span>
            </Link>
          </div>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
          <div className="glass-card rounded-[32px] p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-white space-y-4 text-left animate-slideRight">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-[#006d36]">
                <HelpCircle className="w-5 h-5" />
                <h3 className="font-heading font-extrabold text-base text-[#0f172a]">Password Recovery</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="neo-btn-icon p-1.5 rounded-xl text-[#64748b] hover:text-[#0f172a] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-[#64748b] space-y-3 leading-relaxed">
              <p>
                To reset your Avira Associate password or recover your Member ID:
              </p>
              <div className="neo-inset p-4 rounded-2xl text-[#0f172a] font-medium space-y-1.5">
                <div className="font-bold text-xs text-[#006d36]">Avira Central Support Desk:</div>
                <div>📧 <strong>info@aviralifecare.com</strong></div>
                <div>📞 <strong>+91 97123 26273</strong> (Mon - Sat, 9:30 AM - 6:30 PM)</div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="neo-btn-primary w-full py-3 rounded-2xl font-bold text-xs cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
