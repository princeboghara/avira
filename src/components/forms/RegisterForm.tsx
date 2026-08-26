"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  ShieldCheck,
} from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlRef = searchParams.get("ref");
  const urlPos = searchParams.get("pos");

  // 1. Sponsor Details (Top Field)
  const [sponsorId, setSponsorId] = useState(urlRef ? urlRef.toUpperCase() : "AV00001");
  const [sponsorName, setSponsorName] = useState("Avira Life Care Global");
  const [isVerifyingSponsor, setIsVerifyingSponsor] = useState(false);
  const [sponsorVerified, setSponsorVerified] = useState(true);
  const [isSponsorLocked, setIsSponsorLocked] = useState(Boolean(urlRef));

  // 2. Associate Details
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");

  // 3. Binary Placement Position
  const [binaryPosition, setBinaryPosition] = useState<"LEFT" | "RIGHT">(
    urlPos && urlPos.toUpperCase() === "RIGHT" ? "RIGHT" : "LEFT"
  );
  const [isPositionLocked, setIsPositionLocked] = useState(Boolean(urlPos));

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

  // Compact Success Modal State with Credentials
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
          setErrorMessage("Sponsor ID not found in Avira network.");
        }
      } catch {
        setSponsorVerified(false);
      } finally {
        setIsVerifyingSponsor(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [sponsorId]);

  // 2. Auto-fetch Pincode City & State on 6 digits - DISAPPEARS ON BACKSPACE
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
      // If pincode is erased or less than 6 digits: IMMEDIATELY REMOVE CITY & STATE
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
        colors: ["#50c878", "#006d36", "#ffffff", "#83fba5"],
      });
    } catch {
      // Confetti fallback
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
      setErrorMessage("Please enter your Name");
      return;
    }

    // 10-digit mobile check (any duplicate is allowed!)
    if (!/^\d{10}$/.test(mobile.trim())) {
      setErrorMessage("Please enter a valid 10-digit mobile number");
      return;
    }

    if (pincode.trim().length !== 6 || !city.trim() || !stateName.trim()) {
      setErrorMessage("Please enter a valid 6-digit Pincode to auto-detect City and State");
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
      <div className="w-full max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#e2e2e2] neo-shadow relative">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#006d36] to-[#50c878] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <span className="material-symbols-outlined text-[24px]">eco</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1a1c1c] tracking-tight">
            Create Associate Account
          </h2>
          <p className="text-xs sm:text-sm text-[#5f5e5e] mt-1">
            Join Avira Life Care Global with instant 5-digit member registration.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. SAUTHI UPER: SPONSOR ID (WITH TRUE SIGN & NO "VERIFIED SPONSOR" TEXT) */}
          <div className="p-3.5 rounded-2xl bg-[#f9f9f9] border border-[#e2e2e2] space-y-1.5 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1a1c1c] uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#006d36]">badge</span>
                <span>Sponsor ID *</span>
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
                className={`w-full border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#006d36] neo-inset outline-none text-sm font-mono font-bold tracking-wider ${
                  isSponsorLocked
                    ? "bg-[#eef2ee] text-[#006d36] cursor-not-allowed select-none"
                    : "bg-white text-[#1a1c1c]"
                }`}
              />
              <div className="absolute right-3.5 top-3">
                {isVerifyingSponsor && <Loader2 className="w-4 h-4 text-[#006d36] animate-spin" />}
                {!isVerifyingSponsor && sponsorVerified && (
                  <CheckCircle2 className="w-5 h-5 text-[#006d36]" />
                )}
              </div>
            </div>
            {/* Direct Sponsor Name (NO "VERIFIED SPONSOR" TEXT) */}
            {sponsorVerified && sponsorName && (
              <div className="text-xs text-[#006d36] font-bold flex items-center gap-1.5 pt-1 px-1">
                <span className="material-symbols-outlined text-[16px] text-[#006d36]">person</span>
                <span>{sponsorName}</span>
              </div>
            )}
          </div>

          {/* 2. ASSOCIATE NAME */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1a1c1c] mb-1 uppercase tracking-wider">
                First Name *
              </label>
              <input
                type="text"
                required
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-[#f9f9f9] border-none rounded-xl py-3 px-4 text-[#1a1c1c] focus:ring-2 focus:ring-[#006d36] neo-inset outline-none text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1a1c1c] mb-1 uppercase tracking-wider">
                Last Name
              </label>
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-[#f9f9f9] border-none rounded-xl py-3 px-4 text-[#1a1c1c] focus:ring-2 focus:ring-[#006d36] neo-inset outline-none text-sm font-semibold"
              />
            </div>
          </div>

          {/* 3. MOBILE NUMBER (10 DIGITS - DUPLICATE ALLOWED) */}
          <div>
            <label className="block text-xs font-bold text-[#1a1c1c] mb-1 uppercase tracking-wider">
              Mobile Number (10 Digits) *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#5f5e5e]">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="9876543210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-[#f9f9f9] border-none rounded-xl py-3 pl-11 pr-4 text-[#1a1c1c] focus:ring-2 focus:ring-[#006d36] neo-inset outline-none text-sm font-mono font-bold"
              />
            </div>
          </div>

          {/* 4. BINARY PLACEMENT LEG */}
          <div className="p-3.5 rounded-2xl bg-[#f9f9f9] border border-[#e2e2e2] space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1a1c1c] uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#006d36]">account_tree</span>
                <span>Placement Leg *</span>
              </label>
              {isPositionLocked && (
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Locked</span>
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isPositionLocked && binaryPosition !== "LEFT"}
                onClick={() => !isPositionLocked && setBinaryPosition("LEFT")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  binaryPosition === "LEFT"
                    ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                    : "bg-white border-[#e2e2e2] text-[#5f5e5e] hover:bg-[#f0f3ff]"
                }`}
              >
                <span>Left Leg</span>
              </button>
              <button
                type="button"
                disabled={isPositionLocked && binaryPosition !== "RIGHT"}
                onClick={() => !isPositionLocked && setBinaryPosition("RIGHT")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  binaryPosition === "RIGHT"
                    ? "bg-purple-600 border-purple-600 text-white shadow-sm"
                    : "bg-white border-[#e2e2e2] text-[#5f5e5e] hover:bg-[#f5f0ff]"
                }`}
              >
                <span>Right Leg</span>
              </button>
            </div>
          </div>

          {/* 5. PINCODE (ONLY SHOWS CITY & STATE WHEN 6 DIGITS ARE ENTERED; DISAPPEARS ON BACKSPACE) */}
          <div className="p-3.5 rounded-2xl bg-[#f9f9f9] border border-[#e2e2e2] space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1a1c1c] uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#006d36]">map</span>
                <span>Pincode *</span>
              </label>
              <span className="text-[10px] text-[#5f5e5e]">6 Digits</span>
            </div>
            <div className="relative">
              <input
                type="text"
                maxLength={6}
                required
                placeholder="e.g. 380001"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-white border-none rounded-xl py-3 px-4 text-[#1a1c1c] focus:ring-2 focus:ring-[#006d36] neo-inset outline-none text-sm font-mono font-bold"
              />
              <div className="absolute right-3.5 top-3">
                {isFetchingPincode && <Loader2 className="w-4 h-4 text-[#006d36] animate-spin" />}
                {!isFetchingPincode && pincodeAutofilled && (
                  <CheckCircle2 className="w-5 h-5 text-[#006d36]" />
                )}
              </div>
            </div>

            {/* CONDITIONAL CITY & STATE: ONLY APPEARS IF PINCODE IS EXACTLY 6 DIGITS AND MATCHED */}
            {pincodeAutofilled && city && stateName && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between animate-fadeIn">
                <div>
                  <span className="text-[10px] text-[#006d36] font-bold uppercase tracking-wider block">
                    Detected Location
                  </span>
                  <span className="text-xs font-black text-[#1a1c1c]">
                    {city}, {stateName}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#006d36] bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                  Verified
                </span>
              </div>
            )}
          </div>

          {/* 6. PASSWORD */}
          <div>
            <label className="block text-xs font-bold text-[#1a1c1c] mb-1 uppercase tracking-wider">
              Password *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#5f5e5e]">
                <span className="material-symbols-outlined text-[18px]">lock</span>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#f9f9f9] border-none rounded-xl py-3 pl-11 pr-11 text-[#1a1c1c] focus:ring-2 focus:ring-[#006d36] neo-inset outline-none text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#5f5e5e] hover:text-[#006d36] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 7. TERMS & SUBMIT BUTTON */}
          <div className="flex items-center gap-2 pt-1">
            <input
              id="terms"
              type="checkbox"
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              className="w-4 h-4 text-[#006d36] rounded border-[#e2e2e2] focus:ring-[#006d36]"
            />
            <label htmlFor="terms" className="text-xs text-[#5f5e5e]">
              I agree to the Avira Life Care Global Terms of Association.
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#006d36] hover:bg-[#005025] text-white font-extrabold rounded-2xl shadow-md hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#5f5e5e]">
          Already have an associate account?{" "}
          <Link href="/login" className="font-bold text-[#006d36] hover:underline">
            Log In here
          </Link>
        </div>
      </div>

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
