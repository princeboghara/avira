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
    <div className="w-full flex items-center justify-center py-2 sm:py-4 font-[Arial,sans-serif]">
      
      {/* 3D Matte White Rounded Squircle Box */}
      <div className="relative w-full max-w-[94vw] sm:max-w-[440px] lg:max-w-[460px] rounded-[36px] sm:rounded-[42px] bg-[#fafafc] border-[6px] sm:border-[8px] border-[#c8d0d9] p-7 sm:p-9 flex flex-col items-center justify-center text-center shadow-[20px_32px_60px_rgba(20,30,45,0.22),-10px_-10px_28px_rgba(255,255,255,0.95),inset_0_2px_5px_rgba(255,255,255,1),inset_0_-3px_6px_rgba(0,0,0,0.07)] transition-all duration-300">
        
        {/* Inner White Bevel Rim */}
        <div className="absolute inset-1 sm:inset-1.5 rounded-[32px] sm:rounded-[36px] border border-white pointer-events-none" />

        {/* Content Container */}
        <div className="relative z-10 w-full flex flex-col items-center justify-center space-y-3.5 my-auto">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/avira-logo.png"
              alt="Avira Life Care"
              className="h-16 sm:h-20 lg:h-22 w-auto object-contain mb-2.5 drop-shadow-md transition-transform hover:scale-105"
            />
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight leading-tight">
              Associate Sign In
            </h1>
            <p className="text-[11px] sm:text-xs text-stone-600 font-bold mt-0.5">
              Avira Life Care Global Private Limited
            </p>
          </div>

          {errorMessage && (
            <div className="w-full p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 text-left font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleLogin} className="w-full space-y-3 pt-1">
            
            {/* Member ID Input */}
            <div className="relative w-full">
              <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <input
                id="loginIdentifier"
                name="loginIdentifier"
                type="text"
                maxLength={7}
                autoComplete="username"
                value={loginIdentifier}
                onChange={handleMemberIdChange}
                placeholder="Enter Member ID"
                required
                className="w-full pl-11 pr-4 py-3 bg-white border-2 border-stone-200 focus:border-[#1b3b32] rounded-full text-stone-900 focus:ring-4 focus:ring-[#1b3b32]/10 text-xs sm:text-sm font-bold tracking-wider placeholder-stone-400 outline-none shadow-xs text-left transition-all uppercase"
              />
            </div>

            {/* Password Input with Eye Toggle */}
            <div className="relative w-full">
              <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none z-10" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="PASSWORD"
                required
                className="w-full pl-11 pr-12 py-3 bg-white border-2 border-stone-200 focus:border-[#1b3b32] rounded-full text-stone-900 focus:ring-4 focus:ring-[#1b3b32]/10 text-xs sm:text-sm font-semibold placeholder-stone-400 outline-none shadow-xs text-left transition-all relative z-0"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors focus:outline-none cursor-pointer z-20 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-center justify-end px-2 text-xs">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-stone-500 hover:text-[#1b3b32] transition-colors font-semibold cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            {/* 3D Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 bg-[#1b3b32] hover:bg-[#234e40] text-white rounded-full font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#1b3b32]/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
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

          {/* New Registration Button Section Underneath with Supporting Text */}
          <div className="pt-4 mt-2 border-t border-stone-200/80 w-full flex flex-col items-center gap-2">
            <p className="text-xs text-stone-500 font-medium">
              New to Avira Life Care Global?
            </p>
            <Link
              href="/register"
              className="w-full py-3 px-5 rounded-full bg-white hover:bg-stone-50 border-2 border-stone-300 hover:border-[#1b3b32] text-stone-800 hover:text-[#1b3b32] font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-[#1b3b32]" />
              <span>Create New Associate Account</span>
            </Link>
          </div>

        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-stone-200 space-y-4 animate-in zoom-in-95 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2 text-[#1b3b32]">
                <HelpCircle className="w-5 h-5" />
                <h3 className="font-extrabold text-base text-stone-900">Password Recovery</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-stone-600 space-y-3 leading-relaxed">
              <p>
                To reset your Avira Associate password or recover your 5-digit Member ID:
              </p>
              <div className="p-4 bg-[#f7f5f0] rounded-2xl border border-stone-200 text-stone-900 font-medium space-y-1.5">
                <div className="font-bold text-xs text-[#1b3b32]">Avira Central Support Desk:</div>
                <div>📧 <strong>info@aviralifecare.com</strong></div>
                <div>📞 <strong>+91 97123 26273</strong> (Mon - Sat, 9:30 AM - 6:30 PM)</div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="w-full py-3 rounded-full bg-[#1b3b32] hover:bg-[#234e40] text-white font-bold text-xs cursor-pointer shadow-xs"
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
