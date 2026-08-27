"use client";

import React, { useEffect, useState } from "react";
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Building,
  CreditCard,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Upload,
  Loader2,
} from "lucide-react";
import MemberLayout from "@/components/dashboard/MemberLayout";

interface ProfileData {
  id: string;
  memberId: string;
  fullName: string;
  mobile: string;
  pincode: string;
  email: string;
  address: string;
  city: string;
  state: string;
  gstNumber: string;
  nomineeName: string;
  nomineeRelation: string;
  avatarUrl: string;
  personalPv: number;
  walletBalance: number;
  status: string;
  joinedDate: string;
}

export default function MemberProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Editable Form State
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [nomineeName, setNomineeName] = useState("");
  const [nomineeRelation, setNomineeRelation] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const loadProfile = async () => {
    try {
      const res = await fetch("/api/member/profile");
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        setEmail(data.profile.email || "");
        setAddress(data.profile.address || "");
        setCity(data.profile.city || "");
        setState(data.profile.state || "");
        setGstNumber(data.profile.gstNumber || "");
        setNomineeName(data.profile.nomineeName || "");
        setNomineeRelation(data.profile.nomineeRelation || "");
        setAvatarUrl(data.profile.avatarUrl || "");
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Profile picture must be under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      setAvatarUrl(base64Data); // Local preview immediately

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: base64Data, folder: "avatars" }),
        });
        const data = await res.json();
        if (data.success && data.url) {
          setAvatarUrl(data.url);
        }
      } catch (err) {
        console.error("Avatar Cloudinary upload failed:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");

    try {
      const res = await fetch("/api/member/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avatarUrl,
          email: email.trim(),
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          gstNumber: gstNumber.trim(),
          nomineeName: nomineeName.trim(),
          nomineeRelation: nomineeRelation.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage("Profile updated successfully!");
        setTimeout(() => setSuccessMessage(""), 4000);
        await loadProfile();
      } else {
        alert(data.message || "Failed to update profile.");
      }
    } catch {
      alert("Error saving profile details.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#006d36]">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <span className="text-xs font-bold">Loading Associate Profile...</span>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto pb-12">
        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-[#006d36] font-mono text-[10px] font-black uppercase tracking-wider">
                Account Settings
              </span>
              <span className="text-xs text-[#5f5e5e] font-medium">
                Profile • 1. My Profile
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1a1c1c] tracking-tight">
              Associate Profile Details
            </h1>
            <p className="text-xs text-[#5f5e5e] mt-1">
              View registered credentials and update communication address, profile avatar, GST and nominee.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black border ${
                profile?.status === "ACTIVE"
                  ? "bg-emerald-100 text-[#006d36] border-emerald-300"
                  : "bg-amber-100 text-amber-800 border-amber-300"
              }`}
            >
              Status: {profile?.status || "ACTIVE"}
            </span>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-[#006d36] text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-[#006d36]" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Profile Picture (PFP) Upload & Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs space-y-4">
            <h2 className="text-base font-black text-[#1a1c1c] pb-2 border-b border-[#e2e2e2]">
              Profile Avatar & Identification
            </h2>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt="PFP"
                    className="w-24 h-24 rounded-full object-cover border-4 border-emerald-200 shadow-sm"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#006d36] to-[#50c878] text-white flex items-center justify-center text-3xl font-black shadow-sm">
                    {profile?.fullName?.charAt(0) || "A"}
                  </div>
                )}

                <label className="absolute bottom-0 right-0 p-2 bg-[#006d36] hover:bg-[#005025] text-white rounded-full cursor-pointer shadow-md transition-transform active:scale-95">
                  <Upload className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="text-center sm:text-left space-y-1">
                <span className="text-base font-black text-[#1a1c1c] block">
                  {profile?.fullName}
                </span>
                <span className="font-mono text-xs font-bold text-[#006d36] block">
                  Associate ID: {profile?.memberId}
                </span>
                <span className="text-[11px] text-[#5f5e5e] block">
                  Click the camera icon to upload a personal profile picture (Max 2MB)
                </span>
              </div>
            </div>
          </div>

          {/* Non-Editable Registered Credentials */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e2e2] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#e2e2e2]">
              <h2 className="text-base font-black text-[#1a1c1c] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#5f5e5e]" />
                <span>Permanent Registration Credentials (Non-Editable)</span>
              </h2>
              <span className="text-[10px] text-[#5f5e5e] uppercase font-bold bg-gray-100 px-2 py-0.5 rounded">
                Locked
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {/* Full Name */}
              <div className="p-3 bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#5f5e5e] block">
                  Associate Full Name
                </span>
                <span className="font-bold text-sm text-[#1a1c1c] block">
                  {profile?.fullName}
                </span>
              </div>

              {/* Member ID */}
              <div className="p-3 bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#5f5e5e] block">
                  Member ID
                </span>
                <span className="font-mono font-black text-sm text-[#006d36] block">
                  {profile?.memberId}
                </span>
              </div>

              {/* Mobile Number */}
              <div className="p-3 bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#5f5e5e] block">
                  Mobile Number
                </span>
                <span className="font-mono font-bold text-sm text-[#1a1c1c] block">
                  {profile?.mobile}
                </span>
              </div>

              {/* Registration Pincode */}
              <div className="p-3 bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#5f5e5e] block">
                  Pincode
                </span>
                <span className="font-mono font-bold text-sm text-[#1a1c1c] block">
                  {profile?.pincode}
                </span>
              </div>
            </div>
          </div>

          {/* Editable Communication Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs space-y-4">
            <h2 className="text-base font-black text-[#1a1c1c] pb-2 border-b border-[#e2e2e2]">
              Editable Communication & Nominee Details
            </h2>

            <div className="space-y-4 text-xs">
              {/* Email & GST */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. associate@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-3 font-medium text-xs text-[#1a1c1c] outline-none focus:border-[#006d36]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                    GST Number (If Available)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 24AAAAA0000A1Z5 (Optional)"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                    className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-3 font-mono font-bold text-xs text-[#1a1c1c] uppercase outline-none focus:border-[#006d36]"
                  />
                </div>
              </div>

              {/* Complete Address */}
              <div>
                <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                  Complete Residential / Delivery Address
                </label>
                <textarea
                  rows={3}
                  placeholder="House/Flat No, Street, Landmark, Area..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-3 text-xs text-[#1a1c1c] font-medium outline-none focus:border-[#006d36]"
                />
              </div>

              {/* City & State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Surat or Ahmedabad"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-3 font-bold text-xs text-[#1a1c1c] outline-none focus:border-[#006d36]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                    State
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Gujarat"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-3 font-bold text-xs text-[#1a1c1c] outline-none focus:border-[#006d36]"
                  />
                </div>
              </div>

              {/* Nominee Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#e2e2e2]/60">
                <div>
                  <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                    Nominee Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Family member name"
                    value={nomineeName}
                    onChange={(e) => setNomineeName(e.target.value)}
                    className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-3 font-bold text-xs text-[#1a1c1c] outline-none focus:border-[#006d36]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                    Nominee Relationship
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Spouse / Father / Son"
                    value={nomineeRelation}
                    onChange={(e) => setNomineeRelation(e.target.value)}
                    className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-3 font-bold text-xs text-[#1a1c1c] outline-none focus:border-[#006d36]"
                  />
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-[#e2e2e2] flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3.5 rounded-2xl bg-[#006d36] hover:bg-[#005025] text-white font-black text-xs uppercase tracking-wider shadow-md shadow-[#006d36]/20 cursor-pointer disabled:opacity-60 transition-all flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <span>Update Profile</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </MemberLayout>
  );
}
