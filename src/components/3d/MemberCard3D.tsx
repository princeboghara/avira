"use client";

import React, { useRef, useState } from "react";
import { Copy, Check, ShieldCheck, Sparkles, Cpu } from "lucide-react";

interface MemberCard3DProps {
  memberId: string;
  fullName: string;
  sponsorId?: string;
  joinedDate?: string;
  status?: string;
  interactive?: boolean;
}

export default function MemberCard3D({
  memberId,
  fullName,
  sponsorId = "AV10001",
  joinedDate = "Aug 2026",
  status = "ACTIVE",
  interactive = true,
}: MemberCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Limit rotation angle
    const degX = -(y / (rect.height / 2)) * 14;
    const degY = (x / (rect.width / 2)) * 14;

    setRotateX(degX);
    setRotateY(degY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(memberId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="perspective-1000 w-full max-w-[420px] mx-auto py-4 select-none">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: "transform 0.15s ease-out",
        }}
        className="transform-style-3d relative rounded-2xl p-7 text-white holographic-sheen cursor-pointer shadow-2xl border border-emerald-400/30 overflow-hidden"
      >
        {/* Card Background: Deep Emerald Radial Mesh & Luxury Obsidian */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#064e3b] via-[#022c22] to-[#047857] opacity-95 -z-10" />
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* Diagonal Circuit Watermark Pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#34d399 1px, transparent 1px)`,
            backgroundSize: "16px 16px",
          }}
        />

        {/* Top Header: Logo & Chip */}
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-emerald-200 p-0.5 shadow-lg shadow-emerald-900/50 flex items-center justify-center">
              <div className="w-full h-full bg-[#022c22] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-emerald-100 via-white to-emerald-300">
                AVIRA
              </span>
              <span className="block text-[9px] uppercase tracking-[0.25em] text-emerald-300 font-semibold">
                Network Prestige
              </span>
            </div>
          </div>

          {/* Holographic Chip */}
          <div className="flex items-center gap-2 bg-emerald-950/80 px-3 py-1.5 rounded-lg border border-emerald-500/30 backdrop-blur-sm">
            <Cpu className="w-5 h-5 text-amber-300 animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest text-emerald-300 uppercase">
              RFID SAFE
            </span>
          </div>
        </div>

        {/* Member Unique ID Display */}
        <div className="mb-6 relative z-10">
          <div className="text-[10px] uppercase tracking-widest text-emerald-300/80 font-medium mb-1 flex items-center gap-1.5">
            <span>Official Member ID</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-center justify-between bg-black/30 backdrop-blur-md rounded-xl px-4 py-2.5 border border-emerald-500/20">
            <span className="text-2xl sm:text-3xl font-mono font-black tracking-widest text-white drop-shadow-[0_2px_10px_rgba(52,211,153,0.5)]">
              {memberId}
            </span>
            <button
              onClick={handleCopyId}
              type="button"
              className="flex items-center gap-1.5 text-xs bg-emerald-600/60 hover:bg-emerald-500 text-emerald-100 px-3 py-1.5 rounded-lg transition-all border border-emerald-400/40 shadow-sm"
              title="Copy Member ID"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-200" />
                  <span className="text-[11px] font-semibold text-emerald-200">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Member Info Footer */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-emerald-500/20 relative z-10">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-emerald-300/70 block">
              Cardholder
            </span>
            <span className="text-sm font-bold tracking-wide text-white uppercase truncate block">
              {fullName || "Avira Associate"}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] uppercase tracking-wider text-emerald-300/70 block">
              Sponsor ID
            </span>
            <span className="text-xs font-mono font-semibold text-amber-300">
              {sponsorId}
            </span>
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider text-emerald-300/70 block">
              Member Since
            </span>
            <span className="text-xs font-mono text-emerald-200">{joinedDate}</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] uppercase tracking-wider text-emerald-300/70 block">
              Status
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              {status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
