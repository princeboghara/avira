"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Copy,
  X,
  Phone,
  User as UserIcon,
  BadgeCheck,
  Network,
  MapPin,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function RegisterForm() {
  const searchParams = useSearchParams();

  const urlSponsor = searchParams.get("sponsor") || searchParams.get("ref");
  const urlParent = searchParams.get("parent");
  const urlPos = searchParams.get("pos");

  const isSponsorLocked = Boolean(urlSponsor);
  const isPositionLocked = Boolean(urlPos);

  // 1. Sponsor Details (Blank by default)
  const [sponsorId, setSponsorId] = useState(urlSponsor ? urlSponsor.toUpperCase() : "");
  const [sponsorName, setSponsorName] = useState("");
  const [isVerifyingSponsor, setIsVerifyingSponsor] = useState(false);
  const [sponsorVerified, setSponsorVerified] = useState(false);

  // 2. Associate Details
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");

  // 3. Binary Placement Position
  const [binaryPosition, setBinaryPosition] = useState<"LEFT" | "RIGHT">(
    urlPos && urlPos.toUpperCase() === "RIGHT" ? "RIGHT" : "LEFT"
  );

  // 4. Pincode & Conditional City/State
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);
  const [pincodeAutofilled, setPincodeAutofilled] = useState(false);

  // 5. Password & Terms
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(true);

  // UI States
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Registration Success Modal State
  const [registeredMember, setRegisteredMember] = useState<{
    memberId: string;
    fullName: string;
    passwordText: string;
  } | null>(null);

  // 1. Live Sponsor ID Verification Debounced
  useEffect(() => {
    const cleanId = sponsorId.trim().toUpperCase();
    if (!cleanId || cleanId.length < 3) {
      const resetTimer = setTimeout(() => {
        setSponsorVerified(false);
        setSponsorName("");
      }, 0);
      return () => clearTimeout(resetTimer);
    }

    const timer = setTimeout(async () => {
      setIsVerifyingSponsor(true);
      try {
        const res = await fetch(`/api/sponsor/${cleanId}`);
        const data = await res.json();
        if (data.exists) {
          setSponsorVerified(true);
          setSponsorName(data.fullName);
          setErrorMessage("");
        } else {
          setSponsorVerified(false);
          setSponsorName("");
          setErrorMessage("Sponsor ID not found in Avira network.");
        }
      } catch {
        setSponsorVerified(false);
      } finally {
        setIsVerifyingSponsor(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [sponsorId]);

  // 2. Indian Postal Pincode Auto Lookup
  useEffect(() => {
    const cleanPin = pincode.trim();
    if (cleanPin.length !== 6) {
      const resetPinTimer = setTimeout(() => {
        setPincodeAutofilled(false);
        setCity("");
        setStateName("");
      }, 0);
      return () => clearTimeout(resetPinTimer);
    }

    const timer = setTimeout(async () => {
      setIsFetchingPincode(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
        const data = await res.json();

        if (Array.isArray(data) && data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          setCity(po.District || po.Block || po.Name);
          setStateName(po.State);
          setPincodeAutofilled(true);
          setErrorMessage("");
        } else {
          setPincodeAutofilled(false);
          setCity("");
          setStateName("");
        }
      } catch {
        setPincodeAutofilled(false);
      } finally {
        setIsFetchingPincode(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [pincode]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Fallback
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!sponsorVerified) {
      setErrorMessage("Please enter a valid, verified Sponsor ID");
      return;
    }

    if (!firstName.trim()) {
      setErrorMessage("Please enter your First Name");
      return;
    }

    if (mobile.trim().length !== 10) {
      setErrorMessage("Please enter a 10-digit mobile number");
      return;
    }

    if (pincode.trim().length !== 6 || !city.trim() || !stateName.trim()) {
      setErrorMessage("Please enter a valid 6-digit Pincode");
      return;
    }

    if (!password || password.length < 4) {
      setErrorMessage("Password must be at least 4 characters");
      return;
    }

    if (!termsAgreed) {
      setErrorMessage("Please agree to the Terms & Conditions");
      return;
    }

    setIsSubmitting(true);

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sponsorId: sponsorId.trim().toUpperCase(),
          parentId: urlParent ? urlParent.trim().toUpperCase() : undefined,
          fullName,
          mobile: mobile.trim(),
          password,
          pincode: pincode.trim(),
          city: city.trim(),
          state: stateName.trim(),
          position: binaryPosition,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || "Registration failed.");
        setIsSubmitting(false);
        return;
      }

      // Success!
      setRegisteredMember({
        memberId: data.user.memberId,
        fullName: data.user.fullName,
        passwordText: password,
      });

      triggerConfetti();
    } catch {
      setErrorMessage("Network error occurred during registration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center py-4 sm:py-8">
      {/* Neumorphic Card Container */}
      <div className="relative w-full max-w-[94vw] sm:max-w-[500px] lg:max-w-[540px] rounded-[38px] sm:rounded-[44px] neo-card p-8 sm:p-10 lg:p-11 flex flex-col items-center justify-center text-center border-4 border-white shadow-[12px_12px_28px_rgba(160,178,202,0.45),-12px_-12px_28px_#ffffff] transition-all duration-300">

        {/* Content Container */}
        <div className="relative z-10 w-full flex flex-col items-center justify-center space-y-4 my-auto">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center -mt-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/avira-logo.png"
              alt="Avira Life Care"
              className="h-16 sm:h-20 w-auto object-contain mb-2.5 drop-shadow-sm transition-transform hover:scale-105 duration-300"
            />
            <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#0f172a] tracking-tight leading-tight">
              Associate Registration
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
          <form onSubmit={handleSubmit} className="w-full space-y-3.5 pt-1 text-left">
            
            {/* 1. Sponsor ID */}
            <div className="neo-card-flat border border-white/80 p-3.5 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider flex items-center gap-1.5">
                  <BadgeCheck className="w-3.5 h-3.5 text-[#006d36]" />
                  <span>Sponsor ID *</span>
                </label>
                {isSponsorLocked && (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Locked</span>
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  readOnly={isSponsorLocked}
                  placeholder="Enter Sponsor ID (e.g. AV00001)"
                  value={sponsorId}
                  onChange={(e) => !isSponsorLocked && setSponsorId(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                  className={`neo-input w-full rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-bold tracking-wider ${
                    isSponsorLocked ? "cursor-not-allowed select-none opacity-80" : ""
                  }`}
                />
                <div className="absolute right-3.5 top-2.5">
                  {isVerifyingSponsor && <Loader2 className="w-4 h-4 text-[#006d36] animate-spin" />}
                  {!isVerifyingSponsor && sponsorVerified && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
              </div>

              {sponsorVerified && sponsorName && (
                <div className="text-[11px] text-[#006d36] font-bold flex items-center gap-1.5 pt-0.5">
                  <UserIcon className="w-3.5 h-3.5 text-[#006d36]" />
                  <span className="truncate">{sponsorName}</span>
                </div>
              )}
            </div>

            {/* 2. Associate First & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1 pl-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="neo-input w-full rounded-2xl py-2.5 px-4 text-xs sm:text-sm font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1 pl-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="neo-input w-full rounded-2xl py-2.5 px-4 text-xs sm:text-sm font-bold"
                />
              </div>
            </div>

            {/* 3. Mobile Number */}
            <div>
              <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1 pl-1">
                Mobile Number *
              </label>
              <div className="relative w-full">
                <Phone className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="10-Digit Mobile Number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  className="neo-input w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold tracking-wider"
                />
              </div>
            </div>

            {/* 4. Placement Leg */}
            <div className="neo-card-flat border border-white/80 p-3.5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider flex items-center gap-1.5">
                  <Network className="w-3.5 h-3.5 text-[#006d36]" />
                  <span>Placement Leg *</span>
                </label>
                {isPositionLocked && (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Locked</span>
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={isPositionLocked && binaryPosition !== "LEFT"}
                  onClick={() => !isPositionLocked && setBinaryPosition("LEFT")}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    binaryPosition === "LEFT"
                      ? "neo-btn-primary"
                      : "neo-btn-secondary"
                  }`}
                >
                  <span>Left Leg</span>
                </button>
                <button
                  type="button"
                  disabled={isPositionLocked && binaryPosition !== "RIGHT"}
                  onClick={() => !isPositionLocked && setBinaryPosition("RIGHT")}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    binaryPosition === "RIGHT"
                      ? "neo-btn-primary"
                      : "neo-btn-secondary"
                  }`}
                >
                  <span>Right Leg</span>
                </button>
              </div>
            </div>

            {/* 5. Pincode */}
            <div className="neo-card-flat border border-white/80 p-3.5 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#006d36]" />
                  <span>Pincode *</span>
                </label>
                {pincodeAutofilled && city && stateName ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#006d36] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 animate-fadeIn">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{city}, {stateName}</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-[#94a3b8] font-bold">6 Digits</span>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="Enter 6-Digit Area Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  className="neo-input w-full rounded-xl py-2 px-3 text-xs sm:text-sm font-bold tracking-wide"
                />
                <div className="absolute right-3 top-2">
                  {isFetchingPincode && <Loader2 className="w-4 h-4 text-[#006d36] animate-spin" />}
                </div>
              </div>
            </div>

            {/* 6. Password Input */}
            <div>
              <label className="block text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1 pl-1">
                Password *
              </label>
              <div className="relative w-full">
                <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none z-10" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create strong password"
                  required
                  className="neo-input w-full pl-11 pr-12 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold placeholder-[#94a3b8] relative z-0"
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

            {/* Terms Checkbox */}
            <div className="flex items-center gap-2.5 pt-1 px-1">
              <input
                id="terms"
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="w-4 h-4 text-[#006d36] rounded border-gray-300 focus:ring-[#006d36] cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-[#475569] font-medium cursor-pointer">
                I agree to the Avira Life Care Global Terms of Association.
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="neo-btn-primary w-full py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="pt-2 text-center text-xs text-[#64748b] font-medium">
            Already have an associate account?{" "}
            <Link href="/login" className="font-bold text-[#006d36] hover:underline ml-1">
              Sign In here
            </Link>
          </div>

        </div>
      </div>

      {/* COMPACT CREDENTIALS POPUP */}
      {registeredMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-[38px] sm:rounded-[44px] neo-card p-8 sm:p-10 text-center shadow-2xl border-4 border-white space-y-4 animate-slideRight">
            
            <button
              type="button"
              onClick={() => {
                setRegisteredMember(null);
                setFirstName("");
                setLastName("");
                setMobile("");
                setPassword("");
                setPincode("");
                setCity("");
                setStateName("");
              }}
              className="neo-btn-icon absolute top-5 right-5 p-2 rounded-xl text-[#64748b] hover:text-[#0f172a] cursor-pointer z-20"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-4 relative z-10 flex flex-col items-center">
              <div className="w-14 h-14 mb-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-8 h-8 text-[#006d36]" />
              </div>
              <h3 className="text-xl font-heading font-extrabold text-[#0f172a] tracking-tight">
                Registration Successful!
              </h3>
              <p className="text-xs text-[#64748b] mt-0.5 font-medium">
                Welcome to Avira Life Care Global Network
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-4 space-y-3 mb-4 relative z-10 text-left">
              <div>
                <span className="text-[10px] text-[#64748b] font-bold uppercase tracking-wider block">
                  Associate Name
                </span>
                <span className="text-sm font-bold text-[#0f172a]">
                  {registeredMember.fullName}
                </span>
              </div>

              <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#64748b] font-bold uppercase tracking-wider block">
                    Your Member ID
                  </span>
                  <span className="text-xl font-bold font-mono text-[#006d36] tracking-wider">
                    {registeredMember.memberId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(registeredMember.memberId);
                    alert(`Copied Member ID: ${registeredMember.memberId}`);
                  }}
                  className="neo-btn-secondary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                  title="Copy ID"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>

              <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#64748b] font-bold uppercase tracking-wider block">
                    Password
                  </span>
                  <span className="text-sm font-bold text-[#0f172a] tracking-wide">
                    {registeredMember.passwordText}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(registeredMember.passwordText);
                    alert(`Copied Password!`);
                  }}
                  className="neo-btn-secondary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                  title="Copy Password"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 relative z-10">
              <button
                type="button"
                onClick={() => {
                  const details = `Avira Life Care Global\nName: ${registeredMember.fullName}\nMember ID: ${registeredMember.memberId}\nPassword: ${registeredMember.passwordText}`;
                  navigator.clipboard.writeText(details);
                  alert("Copied all details to clipboard!");
                }}
                className="neo-btn-secondary flex-1 py-3 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-[#006d36]" />
                <span>Copy All Details</span>
              </button>

              <Link
                href="/login"
                className="neo-btn-primary flex-1 py-3 font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <span>Go to Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
