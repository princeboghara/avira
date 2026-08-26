"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, Lock, Copy, X } from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlRef = searchParams.get("ref");
  const urlPos = searchParams.get("pos");

  // Form Fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [sponsorId, setSponsorId] = useState(urlRef ? urlRef.toUpperCase() : "AV00001");
  const [sponsorName, setSponsorName] = useState("Avira Life Care Global");
  const [isVerifyingSponsor, setIsVerifyingSponsor] = useState(false);
  const [sponsorVerified, setSponsorVerified] = useState(true);
  const [isSponsorLocked, setIsSponsorLocked] = useState(Boolean(urlRef));

  const [binaryPosition, setBinaryPosition] = useState<"LEFT" | "RIGHT">(
    urlPos && urlPos.toUpperCase() === "RIGHT" ? "RIGHT" : "LEFT"
  );
  const [isPositionLocked, setIsPositionLocked] = useState(Boolean(urlPos));

  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);
  const [pincodeAutofilled, setPincodeAutofilled] = useState(false);

  const [termsAgreed, setTermsAgreed] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success Modal State with Newly Generated AV ID from Supabase
  const [registeredMember, setRegisteredMember] = useState<{
    memberId: string;
    fullName: string;
    passwordText: string;
  } | null>(null);

  // 1. Live Sponsor ID Verification Debounced
  useEffect(() => {
    const cleanId = sponsorId.trim().toUpperCase();
    if (!cleanId || cleanId.length < 4) {
      setSponsorVerified(false);
      setSponsorName("");
      return;
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
          setErrorMessage("Sponsor ID not found in Supabase network.");
        }
      } catch {
        setSponsorVerified(false);
      } finally {
        setIsVerifyingSponsor(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [sponsorId]);

  // 2. Auto-fetch Pincode City & State on 6 digits
  useEffect(() => {
    const cleanPincode = pincode.trim().replace(/\D/g, "");
    if (cleanPincode.length === 6) {
      setIsFetchingPincode(true);
      fetch(`/api/pincode/${cleanPincode}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setCity(data.city);
            setStateName(data.state);
            setPincodeAutofilled(true);
          } else {
            setPincodeAutofilled(false);
          }
        })
        .catch(() => {
          setPincodeAutofilled(false);
        })
        .finally(() => {
          setIsFetchingPincode(false);
        });
    } else {
      setPincodeAutofilled(false);
    }
  }, [pincode]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#50c878", "#006d36", "#ffffff", "#83fba5"],
      });
    } catch {
      // Fallback
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!firstName.trim()) {
      setErrorMessage("Please enter your First Name");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
      setErrorMessage("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    if (!sponsorVerified) {
      setErrorMessage("Please provide a valid verified Sponsor ID");
      return;
    }

    if (pincode.trim().length !== 6 || !city.trim() || !stateName.trim()) {
      setErrorMessage("Please enter a valid 6-digit postal pincode to auto-fill address");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }

    if (!termsAgreed) {
      setErrorMessage("Please agree to the Terms of Service");
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
    <>
      <main className="w-full max-w-7xl mx-auto flex flex-col md:flex-row rounded-2xl overflow-hidden glass-panel shadow-2xl shadow-[#006d36]/10 min-h-[750px] border border-white/60">
        {/* Left Side: Motivational Branding (Stitch Layout) */}
        <div className="hidden md:flex md:w-5/12 bg-white p-12 flex-col justify-between relative overflow-hidden border-r border-[#e2e2e2]">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#50c878] rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#006d36] rounded-full mix-blend-multiply filter blur-3xl opacity-10 pointer-events-none" />

          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#006d36] to-[#50c878] flex items-center justify-center text-white shadow-md">
                <span className="material-symbols-outlined text-[28px]">diamond</span>
              </div>
              <span className="font-extrabold text-2xl tracking-tighter text-[#006d36]">
                EMERALD ELITE
              </span>
            </Link>
            <h1 className="text-4xl font-extrabold text-[#006d36] mb-4 tracking-tight leading-tight">
              Join the Elite Community
            </h1>
            <p className="text-base text-[#3e4a3f] leading-relaxed">
              Experience unprecedented network growth, precision engineering, and tangible digital
              wealth. Get your unique 5-digit Member ID (<strong className="font-mono text-[#006d36]">AVxxxxx</strong>) and start earning today.
            </p>
          </div>

          <div className="relative z-10 mt-auto pt-8 border-t border-[#e2e2e2]/60">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-[#006d36] border border-emerald-200 shadow-sm">
                <span className="material-symbols-outlined text-[28px]">workspace_premium</span>
              </div>
              <div>
                <p className="font-bold text-base text-[#1a1c1c]">Instant Member Pass</p>
                <p className="text-xs text-[#5f5e5e]">Auto Pincode lookup & live Supabase ledger.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Registration Form (Stitch Layout) */}
        <div className="w-full md:w-7/12 p-8 sm:p-12 lg:p-14 flex flex-col justify-center bg-transparent">
          <div className="md:hidden flex justify-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#006d36] to-[#50c878] flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[22px]">diamond</span>
              </div>
              <span className="font-extrabold text-xl text-[#006d36]">EMERALD ELITE</span>
            </div>
          </div>

          <h2 className="text-3xl font-extrabold text-[#1a1c1c] mb-1">Create Associate Account</h2>
          <p className="text-xs sm:text-sm text-[#5f5e5e] mb-6">
            Enter your details to generate your unique Avira Member ID.
          </p>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1a1c1c] mb-1.5 uppercase tracking-wider">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Rajesh"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-white border-none rounded-xl py-3 px-4 text-[#1a1c1c] focus:ring-2 focus:ring-[#006d36] neo-inset transition-shadow outline-none text-sm placeholder-[#5f5e5e]/40 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1a1c1c] mb-1.5 uppercase tracking-wider">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Patel"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-white border-none rounded-xl py-3 px-4 text-[#1a1c1c] focus:ring-2 focus:ring-[#006d36] neo-inset transition-shadow outline-none text-sm placeholder-[#5f5e5e]/40 font-medium"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-[#1a1c1c] mb-1.5 uppercase tracking-wider">
                Mobile Number (10 Digits) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#5f5e5e]">
                  <span className="material-symbols-outlined text-[20px]">phone</span>
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="9876543210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-white border-none rounded-xl py-3 pl-12 pr-4 text-[#1a1c1c] focus:ring-2 focus:ring-[#006d36] neo-inset transition-shadow outline-none text-sm font-mono placeholder-[#5f5e5e]/40"
                />
              </div>
            </div>

            {/* Sponsor ID with Real-Time Verification */}
            <div className="p-3.5 rounded-xl bg-white border border-[#e2e2e2] space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1a1c1c] uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-[#006d36]">badge</span>
                  <span>Sponsor Referral ID *</span>
                </label>
                {isSponsorLocked ? (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Locked from Tree</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSponsorId("AV00001")}
                    className="text-[10px] font-bold text-[#006d36] hover:underline cursor-pointer"
                  >
                    Use Root (AV00001)
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  readOnly={isSponsorLocked}
                  placeholder="e.g. AV00001"
                  value={sponsorId}
                  onChange={(e) => !isSponsorLocked && setSponsorId(e.target.value.toUpperCase())}
                  className={`w-full border-none rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-[#006d36] neo-inset outline-none text-sm font-mono font-bold tracking-wider ${
                    isSponsorLocked
                      ? "bg-[#eef2ee] text-[#006d36] cursor-not-allowed select-none"
                      : "bg-[#f9f9f9] text-[#1a1c1c]"
                  }`}
                />
                <div className="absolute right-3 top-2.5">
                  {isVerifyingSponsor && <Loader2 className="w-4 h-4 text-[#006d36] animate-spin" />}
                  {!isVerifyingSponsor && sponsorVerified && (
                    <CheckCircle2 className="w-4 h-4 text-[#006d36]" />
                  )}
                </div>
              </div>
              {sponsorVerified && sponsorName && (
                <div className="text-[11px] text-[#006d36] font-semibold flex items-center gap-1 pt-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>
                    Verified Sponsor: <strong>{sponsorName}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Binary Placement Leg Selection */}
            <div className="p-3.5 rounded-xl bg-white border border-[#e2e2e2] space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1a1c1c] uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-[#006d36]">account_tree</span>
                  <span>Binary Placement Leg *</span>
                </label>
                {isPositionLocked && (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Tree Slot Locked</span>
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isPositionLocked && binaryPosition !== "LEFT"}
                  onClick={() => !isPositionLocked && setBinaryPosition("LEFT")}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    binaryPosition === "LEFT"
                      ? "bg-emerald-50 border-[#006d36] text-[#006d36] shadow-sm ring-1 ring-[#006d36]"
                      : "bg-[#f9f9f9] border-[#e2e2e2] text-[#5f5e5e] hover:bg-white"
                  } ${
                    isPositionLocked && binaryPosition !== "LEFT"
                      ? "opacity-35 cursor-not-allowed pointer-events-none"
                      : "cursor-pointer"
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full border border-current flex items-center justify-center">
                    {binaryPosition === "LEFT" && <span className="w-1.5 h-1.5 rounded-full bg-[#006d36]" />}
                  </span>
                  <span>Left Power Leg</span>
                </button>
                <button
                  type="button"
                  disabled={isPositionLocked && binaryPosition !== "RIGHT"}
                  onClick={() => !isPositionLocked && setBinaryPosition("RIGHT")}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    binaryPosition === "RIGHT"
                      ? "bg-emerald-50 border-[#006d36] text-[#006d36] shadow-sm ring-1 ring-[#006d36]"
                      : "bg-[#f9f9f9] border-[#e2e2e2] text-[#5f5e5e] hover:bg-white"
                  } ${
                    isPositionLocked && binaryPosition !== "RIGHT"
                      ? "opacity-35 cursor-not-allowed pointer-events-none"
                      : "cursor-pointer"
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full border border-current flex items-center justify-center">
                    {binaryPosition === "RIGHT" && <span className="w-1.5 h-1.5 rounded-full bg-[#006d36]" />}
                  </span>
                  <span>Right Power Leg</span>
                </button>
              </div>
            </div>

            {/* Pincode with Auto-Fetch City & State */}
            <div className="p-3.5 rounded-xl bg-white border border-[#e2e2e2] space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1a1c1c] uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-[#006d36]">map</span>
                  <span>Address Auto-Discovery</span>
                </span>
                <span className="text-[10px] text-[#006d36] font-medium">Type 6-digit PIN</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="Pincode (380001)"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-[#f9f9f9] border-none rounded-lg py-2 px-3 text-xs font-mono font-bold text-[#1a1c1c] neo-inset outline-none"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#f9f9f9] border-none rounded-lg py-2 px-3 text-xs text-[#1a1c1c] neo-inset outline-none font-medium"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full bg-[#f9f9f9] border-none rounded-lg py-2 px-3 text-xs text-[#1a1c1c] neo-inset outline-none font-medium"
                  />
                </div>
              </div>
              {pincodeAutofilled && (
                <span className="text-[10px] text-[#006d36] font-semibold block">
                  ✓ Verified: {city}, {stateName}
                </span>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-[#1a1c1c] mb-1.5 uppercase tracking-wider">
                Password *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#5f5e5e]">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border-none rounded-xl py-3 pl-12 pr-12 text-[#1a1c1c] focus:ring-2 focus:ring-[#006d36] neo-inset transition-shadow outline-none text-sm placeholder-[#5f5e5e]/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#5f5e5e] hover:text-[#006d36] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="w-4 h-4 text-[#006d36] rounded border-[#6e7a6e] focus:ring-[#006d36] neo-inset mt-0.5 cursor-pointer"
              />
              <label htmlFor="terms" className="ml-2 text-xs text-[#5f5e5e] cursor-pointer">
                I agree to the <span className="text-[#006d36] font-semibold underline">Terms of Service</span> and{" "}
                <span className="text-[#006d36] font-semibold underline">Network Compensation Policy</span>.
              </label>
            </div>

            {/* Submit button from Stitch */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl font-bold text-base text-white bg-[#006d36] hover:bg-[#005025] neo-shadow hover:scale-[1.01] active:scale-95 transition-all duration-300 shadow-md cursor-pointer disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Assigning Unique AV ID in Supabase...</span>
                </>
              ) : (
                <>
                  <span>Create Associate Account</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#5f5e5e]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-[#006d36] hover:text-[#50c878] transition-colors ml-1"
            >
              Log in
            </Link>
          </p>
        </div>
      </main>

      {/* COMPACT CREDENTIALS POPUP WITH CLOSE (X) BUTTON */}
      {registeredMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 border border-[#50c878] shadow-2xl relative animate-scaleIn">
            {/* Close (X) button at top-right */}
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
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-4">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-emerald-50 border border-emerald-300 flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-6 h-6 text-[#006d36]" />
              </div>
              <h3 className="text-lg font-black text-[#1a1c1c]">Registration Successful</h3>
              <p className="text-[11px] text-[#5f5e5e] mt-0.5">
                New associate profile created in Supabase PostgreSQL
              </p>
            </div>

            {/* ONLY Name, ID Number, and Password */}
            <div className="bg-[#f9f9f9] rounded-2xl p-4 border border-[#e2e2e2] space-y-3 mb-5">
              <div>
                <span className="text-[10px] text-[#5f5e5e] font-bold uppercase tracking-wider block">
                  Associate Name
                </span>
                <span className="text-sm font-extrabold text-[#1a1c1c]">
                  {registeredMember.fullName}
                </span>
              </div>

              <div className="pt-2 border-t border-[#e2e2e2]/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#5f5e5e] font-bold uppercase tracking-wider block">
                    Member ID
                  </span>
                  <span className="text-xl font-mono font-black text-[#006d36] tracking-wider">
                    {registeredMember.memberId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(registeredMember.memberId);
                    alert(`Copied ID: ${registeredMember.memberId}`);
                  }}
                  className="p-1.5 hover:bg-emerald-100 text-[#006d36] rounded-lg transition-colors cursor-pointer"
                  title="Copy ID"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-2 border-t border-[#e2e2e2]/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#5f5e5e] font-bold uppercase tracking-wider block">
                    Password
                  </span>
                  <span className="text-sm font-mono font-black text-[#1a1c1c] tracking-wide">
                    {registeredMember.passwordText}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(registeredMember.passwordText);
                    alert(`Copied Password!`);
                  }}
                  className="p-1.5 hover:bg-emerald-100 text-[#006d36] rounded-lg transition-colors cursor-pointer"
                  title="Copy Password"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const details = `Avira Life Care Global\nName: ${registeredMember.fullName}\nMember ID: ${registeredMember.memberId}\nPassword: ${registeredMember.passwordText}`;
                  navigator.clipboard.writeText(details);
                  alert("Copied all details to clipboard!");
                }}
                className="flex-1 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#006d36] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Details</span>
              </button>

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
                className="flex-1 py-2.5 bg-[#006d36] hover:bg-[#005025] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Done / Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
