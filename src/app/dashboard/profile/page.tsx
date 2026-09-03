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
  Save,
} from "lucide-react";
import MemberLayout from "@/components/member/MemberLayout";

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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Editable Form State (Address, Email, GST, Nominee, Avatar)
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [nomineeName, setNomineeName] = useState("");
  const [nomineeRelation, setNomineeRelation] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const loadProfile = async () => {
    try {
      const res = await fetch("/api/member/profile", { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        setEmail(data.profile.email || "");
        setAddress(data.profile.address || "");
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

    setUploadingAvatar(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: base64Data, folder: "avatars" }),
        });
        const data = await res.json();
        if (data.success && data.url) {
          setAvatarUrl(data.url);
        } else {
          setAvatarUrl(base64Data);
        }
      } catch (err) {
        console.error("Avatar upload error:", err);
        setAvatarUrl(base64Data);
      } finally {
        setUploadingAvatar(false);
      }
    };
    reader.onerror = () => {
      setUploadingAvatar(false);
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
          email,
          address,
          gstNumber,
          nomineeName,
          nomineeRelation,
          avatarUrl,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage("Profile information updated successfully!");
        await loadProfile();
      } else {
        alert(data.message || "Failed to update profile.");
      }
    } catch {
      alert("Network error updating profile.");
    } finally {
      setSaving(false);
    }
  };

  const profileRequirements = [
    { key: "avatarUrl", label: "Profile Photo", filled: !!avatarUrl },
    { key: "fullName", label: "Full Name", filled: !!profile?.fullName },
    { key: "mobile", label: "Mobile Number", filled: !!profile?.mobile },
    { key: "email", label: "Email Address", filled: !!email },
    { key: "address", label: "Complete Address", filled: !!address },
    { key: "city", label: "City", filled: !!profile?.city },
    { key: "state", label: "State", filled: !!profile?.state },
    { key: "pincode", label: "Pincode", filled: !!profile?.pincode },
    { key: "nomineeName", label: "Nominee Name", filled: !!nomineeName },
    { key: "nomineeRelation", label: "Nominee Relation", filled: !!nomineeRelation },
  ];

  const filledCount = profileRequirements.filter((r) => r.filled).length;
  const missingRequirements = profileRequirements.filter((r) => !r.filled);
  const profileCompletion = Math.round((filledCount / profileRequirements.length) * 100);

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#006d36]">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <span className="text-xs font-bold font-mono">Loading Associate Profile...</span>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-[#006d36] font-mono text-[10px] font-black uppercase tracking-wider">
                Account Settings
              </span>
              <span className="text-xs text-[#5f5e5e] font-medium">
                My Profile
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1a1c1c] tracking-tight">
              Associate Profile & Identity
            </h1>
            <p className="text-xs text-[#5f5e5e] mt-1">
              View permanent registration credentials and manage communication address, profile picture, GST and nominee.
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

        {/* Prominent Profile Updated Sign Notification */}
        {successMessage && (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 text-xs sm:text-sm font-black flex items-center justify-between gap-3 animate-fadeIn border border-emerald-400">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-white text-[#006d36] flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-5 h-5 fill-emerald-600 text-white" />
              </div>
              <div>
                <span className="block font-black text-sm">Profile Updated Successfully!</span>
                <span className="block text-[11px] font-medium text-emerald-100">{successMessage}</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-white/20 text-white font-mono text-[10px] uppercase font-bold tracking-wider">
              Saved
            </span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Profile Picture (PFP) Upload with Circular Progress Round Bar */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-base font-black text-[#1a1c1c] pb-2 border-b border-gray-100">
              Profile Avatar & Completion Progress
            </h2>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative flex items-center justify-center shrink-0">
                {/* Circular Progress SVG Gauge Ring */}
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    className="stroke-slate-100"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    className="stroke-[#006d36] transition-all duration-700 ease-out"
                    strokeWidth="6"
                    strokeDasharray={2 * Math.PI * 54}
                    strokeDashoffset={2 * Math.PI * 54 * (1 - profileCompletion / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                {/* PFP inside Gauge Ring */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt="PFP"
                      className="w-24 h-24 rounded-full object-cover shadow-sm"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#006d36] to-[#50c878] text-white flex items-center justify-center text-3xl font-black shadow-sm">
                      {profile?.fullName?.charAt(0) || "A"}
                    </div>
                  )}

                  {/* Uploading Overlay */}
                  {uploadingAvatar && (
                    <div className="absolute w-24 h-24 rounded-full bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20 p-2 text-center animate-fadeIn shadow-lg">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mb-1" />
                      <span className="text-[8px] font-black uppercase tracking-wider text-emerald-300 leading-tight">Wait, uploading...</span>
                    </div>
                  )}
                </div>

                <label
                  className={`absolute bottom-1 right-1 p-2 bg-[#006d36] hover:bg-[#005025] text-white rounded-full shadow-md transition-transform z-10 ${
                    uploadingAvatar
                      ? "opacity-50 cursor-not-allowed pointer-events-none"
                      : "cursor-pointer active:scale-95"
                  }`}
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingAvatar}
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#006d36] text-xs font-black">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{profileCompletion}% Profile Complete</span>
                </div>
                <h3 className="text-lg font-black text-[#1a1c1c]">{profile?.fullName}</h3>
                <p className="text-xs text-[#5f5e5e] font-mono">
                  Member ID: <span className="font-bold text-[#006d36]">{profile?.memberId}</span>
                </p>

                {/* Missing Details Checklist */}
                {missingRequirements.length > 0 ? (
                  <div className="pt-1 text-left">
                    <span className="text-[11px] font-bold text-amber-800 block mb-1">
                      Missing details to reach 100% completion:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {missingRequirements.map((item) => (
                        <span
                          key={item.key}
                          className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold"
                        >
                          • {item.label}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium block mt-1">
                      (Note: GSTIN is optional and excluded from the completion score)
                    </span>
                  </div>
                ) : (
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#006d36] border border-emerald-300 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>All Required Details Complete! (100%)</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Non-Editable Registered Credentials (PINCODE, CITY, STATE ARE LOCKED) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h2 className="text-base font-black text-[#1a1c1c] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#5f5e5e]" />
                <span>Permanent Registration Credentials (Non-Editable / Read-Only)</span>
              </h2>
              <span className="text-[10px] text-[#5f5e5e] uppercase font-bold bg-gray-100 px-2.5 py-0.5 rounded-full">
                Locked By Master Admin
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              {/* Full Name */}
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/70 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#5f5e5e] block">
                  Associate Full Name
                </span>
                <span className="font-bold text-sm text-[#1a1c1c] block">
                  {profile?.fullName}
                </span>
              </div>

              {/* Member ID */}
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/70 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#5f5e5e] block">
                  Member ID
                </span>
                <span className="font-mono font-black text-sm text-[#006d36] block">
                  {profile?.memberId}
                </span>
              </div>

              {/* Mobile Number */}
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/70 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#5f5e5e] block">
                  Mobile Number
                </span>
                <span className="font-mono font-bold text-sm text-[#1a1c1c] block">
                  {profile?.mobile}
                </span>
              </div>

              {/* Registration Pincode (LOCKED) */}
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/70 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#5f5e5e] block">
                  Registration Pincode (Locked)
                </span>
                <span className="font-mono font-bold text-sm text-[#1a1c1c] block">
                  {profile?.pincode || "—"}
                </span>
              </div>

              {/* City (LOCKED) */}
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/70 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#5f5e5e] block">
                  City / District (Locked)
                </span>
                <span className="font-bold text-sm text-[#1a1c1c] block">
                  {profile?.city || "—"}
                </span>
              </div>

              {/* State (LOCKED) */}
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/70 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#5f5e5e] block">
                  State (Locked)
                </span>
                <span className="font-bold text-sm text-[#1a1c1c] block">
                  {profile?.state || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Editable Communication Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-base font-black text-[#1a1c1c] pb-2 border-b border-gray-100">
              Editable Communication & Nominee Details
            </h2>

            <div className="space-y-4 text-xs">
              {/* Email & GST */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                    Email Address:
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. associate@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-medium text-xs text-[#1a1c1c] outline-hidden focus:border-[#006d36] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                    GST Number (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 24AAAAA0000A1Z5"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-mono font-bold text-xs text-[#1a1c1c] uppercase outline-hidden focus:border-[#006d36] focus:bg-white"
                  />
                </div>
              </div>

              {/* Complete Address */}
              <div>
                <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                  Complete Delivery Address (House/Flat No, Street, Landmark):
                </label>
                <textarea
                  rows={3}
                  placeholder="House/Flat No, Building, Street, Landmark..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-[#1a1c1c] font-medium outline-hidden focus:border-[#006d36] focus:bg-white"
                />
              </div>

              {/* Nominee Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                    Nominee Full Name:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Family member name"
                    value={nomineeName}
                    onChange={(e) => setNomineeName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold text-xs text-[#1a1c1c] outline-hidden focus:border-[#006d36] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                    Nominee Relationship:
                  </label>
                  <select
                    value={nomineeRelation}
                    onChange={(e) => setNomineeRelation(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold text-xs text-[#1a1c1c] outline-hidden focus:border-[#006d36] focus:bg-white cursor-pointer"
                  >
                    <option value="">-- Select Relationship --</option>
                    <option value="Spouse">Spouse (Husband / Wife)</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 rounded-2xl bg-[#006d36] hover:bg-[#005025] text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{saving ? "Saving Changes..." : "Update Profile"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </MemberLayout>
  );
}
