"use client";

import React, { useState } from "react";
import {
  KeyRound,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import MemberLayout from "@/components/dashboard/MemberLayout";

export default function MemberChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMessage("Please fill all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirm password do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters long.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/member/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage("Your password has been changed successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setErrorMessage(data.message || "Failed to change password.");
      }
    } catch {
      setErrorMessage("Network error while changing password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MemberLayout>
      <div className="space-y-6 animate-fadeIn max-w-xl mx-auto pb-12">
        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-[#006d36] font-mono text-[10px] font-black uppercase tracking-wider">
              Security Portal
            </span>
            <span className="text-xs text-[#5f5e5e] font-medium">
              Profile • 3. Change Password
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1a1c1c] tracking-tight">
            Change Account Password
          </h1>
          <p className="text-xs text-[#5f5e5e] mt-1">
            Enter your current account password followed by your new password twice.
          </p>
        </div>

        {/* Alerts */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-[#006d36] text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-[#006d36]" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-700 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Change Password Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#5f5e5e]" />
                <span>Current / Old Password *</span>
              </label>
              <input
                type="password"
                placeholder="Enter current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-3 text-xs text-[#1a1c1c] outline-none focus:border-[#006d36]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#006d36]" />
                <span>New Password *</span>
              </label>
              <input
                type="password"
                placeholder="Enter new secure password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-3 text-xs text-[#1a1c1c] outline-none focus:border-[#006d36]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#006d36]" />
                <span>Confirm New Password *</span>
              </label>
              <input
                type="password"
                placeholder="Re-enter new password to confirm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-3 text-xs text-[#1a1c1c] outline-none focus:border-[#006d36]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 rounded-2xl bg-[#006d36] hover:bg-[#005025] text-white font-black text-xs uppercase tracking-wider shadow-md shadow-[#006d36]/20 cursor-pointer disabled:opacity-60 transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MemberLayout>
  );
}
