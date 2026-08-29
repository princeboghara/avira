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

  // 3D Registration Success Modal State
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
    }, 250);

    return () => clearTimeout(timer);
  }, [sponsorId]);

  // 2. Immediate Fast Pincode City & State on 6 digits
  useEffect(() => {
    const cleanPincode = pincode.trim().replace(/\D/g, "");
    if (cleanPincode.length === 6) {
      setIsFetchingPincode(true);
      fetch(`/api/pincode/${cleanPincode}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.city && data.state) {
            setCity(data.city);
            setStateName(data.state);
            setPincodeAutofilled(true);
          } else {
            setCity("");
            setStateName("");
            setPincodeAutofilled(false);
          }
        })
        .catch(() => {
          setCity("");
          setStateName("");
          setPincodeAutofilled(false);
        })
        .finally(() => {
          setIsFetchingPincode(false);
        });
    } else {
      setCity("");
      setStateName("");
      setPincodeAutofilled(false);
    }
  }, [pincode]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#1b3b32", "#059669", "#ffffff", "#34d399"],
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
    <div className="w-full flex items-center justify-center py-2 sm:py-4 font-[Arial,sans-serif]">
      
      {/* 3D Matte White Squircle Box with Depth Grey Border */}
      <div className="relative w-full max-w-[94vw] sm:max-w-[500px] lg:max-w-[540px] rounded-[36px] sm:rounded-[44px] bg-[#fafafc] border-[6px] sm:border-[8px] lg:border-[10px] border-[#c8d0d9] p-7 sm:p-10 lg:p-12 flex flex-col items-center justify-center text-center shadow-[20px_32px_60px_rgba(20,30,45,0.22),-10px_-10px_28px_rgba(255,255,255,0.95),inset_0_2px_5px_rgba(255,255,255,1),inset_0_-3px_6px_rgba(0,0,0,0.07)] transition-all duration-300">
        
        {/* Inner White Bevel Rim */}
        <div className="absolute inset-1 sm:inset-1.5 rounded-[32px] sm:rounded-[38px] border border-white pointer-events-none" />

        {/* Content Container */}
        <div className="relative z-10 w-full flex flex-col items-center justify-center space-y-3.5 my-auto">
          
          {/* Bigger Logo & Header */}
          <div className="flex flex-col items-center -mt-1 sm:-mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/avira-logo.png"
              alt="Avira Life Care"
              className="h-16 sm:h-20 lg:h-22 w-auto object-contain mb-2.5 drop-shadow-md transition-transform hover:scale-105"
            />
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight leading-tight">
              Associate Registration
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
          <form onSubmit={handleSubmit} className="w-full space-y-3 pt-1">
            
            {/* 1. Sponsor ID (Without 'AV0001' in placeholder) */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-white border-2 border-stone-200 space-y-1 text-left shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5 text-[#1b3b32]" />
                  <span>Sponsor ID *</span>
                </label>
                {isSponsorLocked && (
                  <span className="text-[9.5px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
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
                  placeholder="Enter Sponsor ID"
                  value={sponsorId}
                  onChange={(e) => !isSponsorLocked && setSponsorId(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                  className={`w-full rounded-xl py-2.5 px-3.5 outline-none text-xs sm:text-sm font-bold tracking-wider border ${
                    isSponsorLocked
                      ? "bg-[#eef2ee] text-[#1b3b32] border-emerald-200 cursor-not-allowed select-none"
                      : "bg-[#f7f5f0] text-stone-900 border-stone-200 focus:bg-white focus:border-[#1b3b32]"
                  }`}
                />
                <div className="absolute right-3.5 top-2.5">
                  {isVerifyingSponsor && <Loader2 className="w-4 h-4 text-[#1b3b32] animate-spin" />}
                  {!isVerifyingSponsor && sponsorVerified && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
              </div>

              {sponsorVerified && sponsorName && (
                <div className="text-[11px] text-[#1b3b32] font-bold flex items-center gap-1 pt-0.5">
                  <UserIcon className="w-3 h-3 text-[#1b3b32]" />
                  <span className="truncate">{sponsorName}</span>
                </div>
              )}
            </div>

            {/* 2. Associate First & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                required
                placeholder="First Name *"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-white border-2 border-stone-200 focus:border-[#1b3b32] rounded-full py-2.5 px-4 text-stone-900 focus:ring-4 focus:ring-[#1b3b32]/10 outline-none text-xs sm:text-sm font-bold shadow-xs text-left"
              />
              <input
                type="text"
                required
                placeholder="Last Name *"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-white border-2 border-stone-200 focus:border-[#1b3b32] rounded-full py-2.5 px-4 text-stone-900 focus:ring-4 focus:ring-[#1b3b32]/10 outline-none text-xs sm:text-sm font-bold shadow-xs text-left"
              />
            </div>

            {/* 3. Mobile Number */}
            <div className="relative w-full">
              <Phone className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="Mobile Number (10 Digits) *"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-white border-2 border-stone-200 focus:border-[#1b3b32] rounded-full text-stone-900 focus:ring-4 focus:ring-[#1b3b32]/10 text-xs sm:text-sm font-bold tracking-wider placeholder-stone-400 outline-none shadow-xs text-left transition-all"
              />
            </div>

            {/* 4. Placement Leg */}
            <div className="p-3 rounded-2xl bg-white border-2 border-stone-200 space-y-1.5 text-left shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1">
                  <Network className="w-3.5 h-3.5 text-[#1b3b32]" />
                  <span>Placement Leg *</span>
                </label>
                {isPositionLocked && (
                  <span className="text-[9.5px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Locked</span>
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isPositionLocked && binaryPosition !== "LEFT"}
                  onClick={() => !isPositionLocked && setBinaryPosition("LEFT")}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    binaryPosition === "LEFT"
                      ? "bg-[#1b3b32] border-[#1b3b32] text-white shadow-xs"
                      : "bg-[#f7f5f0] border-stone-200 text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  <span>Left Leg</span>
                </button>
                <button
                  type="button"
                  disabled={isPositionLocked && binaryPosition !== "RIGHT"}
                  onClick={() => !isPositionLocked && setBinaryPosition("RIGHT")}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    binaryPosition === "RIGHT"
                      ? "bg-[#1b3b32] border-[#1b3b32] text-white shadow-xs"
                      : "bg-[#f7f5f0] border-stone-200 text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  <span>Right Leg</span>
                </button>
              </div>
            </div>

            {/* 5. Pincode (Without '395006' in placeholder) */}
            <div className="p-3 rounded-2xl bg-white border-2 border-stone-200 space-y-1.5 text-left shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#1b3b32]" />
                  <span>Pincode *</span>
                </label>
                {pincodeAutofilled && city && stateName ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1b3b32] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 animate-in fade-in">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{city}, {stateName}</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-stone-500 font-bold">6 Digits</span>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="Enter 6-Digit Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-[#f7f5f0] border border-stone-200 focus:bg-white focus:border-[#1b3b32] rounded-xl py-2 px-3 text-stone-900 outline-none text-xs sm:text-sm font-bold tracking-wide"
                />
                <div className="absolute right-3 top-2">
                  {isFetchingPincode && <Loader2 className="w-4 h-4 text-[#1b3b32] animate-spin" />}
                </div>
              </div>
            </div>

            {/* 6. Password Input with Eye Toggle */}
            <div className="relative w-full">
              <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none z-10" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create Password *"
                required
                className="w-full pl-11 pr-12 py-2.5 sm:py-3 bg-white border-2 border-stone-200 focus:border-[#1b3b32] rounded-full text-stone-900 focus:ring-4 focus:ring-[#1b3b32]/10 text-xs sm:text-sm font-bold placeholder-stone-400 outline-none shadow-xs text-left transition-all relative z-0"
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

            {/* Terms */}
            <div className="flex items-center gap-2 pt-0.5 px-2 text-left">
              <input
                id="terms"
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="w-4 h-4 text-[#1b3b32] rounded border-stone-300 focus:ring-[#1b3b32]"
              />
              <label htmlFor="terms" className="text-xs text-stone-700 font-bold cursor-pointer">
                I agree to the Avira Life Care Global Terms of Association.
              </label>
            </div>

            {/* 3D Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 bg-[#1b3b32] hover:bg-[#234e40] text-white rounded-full font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#1b3b32]/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
          <div className="pt-1 text-center text-xs text-stone-600 font-bold">
            Already have an associate account?{" "}
            <Link href="/login" className="font-bold text-[#1b3b32] hover:underline ml-1">
              Sign In here
            </Link>
          </div>

        </div>

      </div>

      {/* COMPACT CREDENTIALS POPUP */}
      {registeredMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-[38px] sm:rounded-[44px] bg-[#fafafc] border-[6px] sm:border-[8px] border-[#c8d0d9] p-7 sm:p-9 text-center shadow-[20px_32px_60px_rgba(20,30,45,0.3),inset_0_2px_5px_rgba(255,255,255,1)] animate-in zoom-in-95 font-[Arial,sans-serif]">
            
            <div className="absolute inset-1 sm:inset-1.5 rounded-[32px] sm:rounded-[36px] border border-white pointer-events-none" />

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
              className="absolute top-5 right-5 p-1.5 rounded-full bg-white border border-stone-200 hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer z-20"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-5 relative z-10 flex flex-col items-center">
              <div className="w-14 h-14 mb-2.5 rounded-full bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-8 h-8 text-[#1b3b32]" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 tracking-tight">
                Registration Successful!
              </h3>
              <p className="text-xs text-stone-600 mt-0.5 font-bold">
                Welcome to Avira Life Care Global Network
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border-2 border-stone-200 space-y-3 mb-5 relative z-10 text-left shadow-xs">
              <div>
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
                  Associate Name
                </span>
                <span className="text-sm font-bold text-stone-900">
                  {registeredMember.fullName}
                </span>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
                    Your 5-Digit Member ID
                  </span>
                  <span className="text-xl font-bold text-[#1b3b32] tracking-wider">
                    {registeredMember.memberId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(registeredMember.memberId);
                    alert(`Copied Member ID: ${registeredMember.memberId}`);
                  }}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#1b3b32] border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Copy ID"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
                    Password
                  </span>
                  <span className="text-sm font-bold text-stone-900 tracking-wide">
                    {registeredMember.passwordText}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(registeredMember.passwordText);
                    alert(`Copied Password!`);
                  }}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#1b3b32] border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Copy Password"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 relative z-10">
              <button
                type="button"
                onClick={() => {
                  const details = `Avira Life Care Global\nName: ${registeredMember.fullName}\nMember ID: ${registeredMember.memberId}\nPassword: ${registeredMember.passwordText}`;
                  navigator.clipboard.writeText(details);
                  alert("Copied all details to clipboard!");
                }}
                className="flex-1 py-3 bg-white hover:bg-stone-50 text-stone-800 border-2 border-stone-300 font-bold rounded-full text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-[#1b3b32]" />
                <span>Copy All Details</span>
              </button>

              <Link
                href="/login"
                className="flex-1 py-3 bg-[#1b3b32] hover:bg-[#234e40] text-white font-bold rounded-full text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all"
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
