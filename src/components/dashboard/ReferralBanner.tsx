"use client";

import React, { useState, useEffect } from "react";
import { Copy, Check, Share2, QrCode, ExternalLink } from "lucide-react";
import { User } from "@/types";

export default function ReferralBanner({ user }: { user: User }) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const referralUrl = mounted && typeof window !== "undefined"
    ? `${window.location.origin}/register?ref=${user.memberId}`
    : `https://avira.com/register?ref=${user.memberId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-emerald rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border border-emerald-400/30 shadow-2xl mb-8">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-60 h-60 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-400/30 text-emerald-300 text-xs font-bold">
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active Referral Link • Direct 10% Instant Bonus</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Share Your Link & Grow Your Downline
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
            Anyone who joins via this link has your Sponsor ID{" "}
            <strong className="font-mono text-amber-300 font-bold">{user.memberId}</strong>{" "}
            automatically locked in. Earn instant direct referral bonuses & team matching.
          </p>
        </div>

        {/* Copy Box & Actions */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="bg-emerald-950/90 border border-emerald-400/30 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 min-w-[280px]">
            <span className="text-xs font-mono text-emerald-200 truncate select-all">
              {referralUrl}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition-all shadow-md flex-shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={() => setShowQR(!showQR)}
            className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-2xl border border-white/20 transition-all font-semibold text-xs"
            title="Show QR Code"
          >
            <QrCode className="w-4 h-4 text-emerald-300" />
            <span>QR Code</span>
          </button>
        </div>
      </div>

      {/* QR Code Modal Drawer */}
      {showQR && (
        <div className="mt-6 pt-6 border-t border-emerald-500/20 flex flex-col sm:flex-row items-center gap-6 animate-fadeIn">
          <div className="bg-white p-3 rounded-2xl shadow-xl">
            {/* Generates SVG-based clean QR Code mockup */}
            <div className="w-32 h-32 bg-slate-900 rounded-lg flex flex-col items-center justify-center p-2 text-center">
              <QrCode className="w-20 h-20 text-emerald-400" />
              <span className="text-[9px] font-mono text-white mt-1">{user.memberId}</span>
            </div>
          </div>
          <div className="text-left space-y-1">
            <span className="text-xs font-bold text-amber-300 block">Mobile Scan Referral</span>
            <p className="text-xs text-emerald-100/80 max-w-sm">
              Your prospects can point their mobile camera at this QR code to immediately open the
              registration page with your Sponsor ID pre-filled.
            </p>
            <a
              href={referralUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:text-white font-semibold pt-1"
            >
              <span>Test referral URL directly</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
