"use client";

import React, { useEffect, useState } from "react";
import ShoppyLayout from "@/components/shoppy/ShoppyLayout";
import {
  Store,
  User,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Building,
  Loader2,
  Package,
} from "lucide-react";

interface ShoppyProfile {
  id: string;
  shoppyId: string;
  storeName: string;
  ownerName: string;
  mobile: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  status: string;
}

export default function ShoppyProfilePage() {
  const [profile, setProfile] = useState<ShoppyProfile | null>({
    id: "shp_surat_hub_01",
    shoppyId: "AVS01",
    storeName: "SURAT PARCEL HUB",
    ownerName: "Hub Manager",
    mobile: "9876543210",
    email: "suratparcelhub@aviralifecare.com",
    address: "Surat Central Logistics & Parcel Hub, Ring Road",
    city: "Surat",
    state: "Gujarat",
    pincode: "395002",
    status: "ACTIVE",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/shoppy/auth/me");
        const data = await res.json();
        if (data.success && data.shoppy) {
          setProfile(data.shoppy);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  return (
    <ShoppyLayout>
      <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
        {/* Header Neumorphic Card */}
        <div className="shoppy-surface rounded-3xl p-6 sm:p-8 border border-white/80 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-1 rounded-full shoppy-inset-sm font-mono text-[10px] font-black uppercase tracking-wider text-[#006d36]">
                Primary Logistics Hub
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Official Center Profile
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              SURAT PARCEL HUB Profile
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Official registration, hub dispatch coordinates, and contact details.
            </p>
          </div>
          <div className="w-14 h-14 rounded-3xl shoppy-inset-sm flex items-center justify-center text-[#006d36] shrink-0">
            <Store className="w-7 h-7" />
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-[#006d36]" />
            <p className="text-xs font-mono font-bold">Loading hub profile...</p>
          </div>
        ) : !profile ? (
          <div className="p-8 text-center shoppy-surface rounded-3xl border border-white/80 text-slate-500">
            Failed to load profile. Please refresh.
          </div>
        ) : (
          <div className="shoppy-surface rounded-3xl p-6 sm:p-8 border border-white/80 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Shoppy ID */}
              <div className="shoppy-inset rounded-2xl p-4 space-y-1">
                <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block">
                  Shoppy Center Code
                </span>
                <p className="font-mono text-xl font-black text-[#006d36]">
                  {profile.shoppyId}
                </p>
              </div>

              {/* Status */}
              <div className="shoppy-inset rounded-2xl p-4 space-y-1">
                <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block">
                  Operational Status
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-black bg-emerald-100 text-[#006d36] border border-emerald-300">
                  <ShieldCheck className="w-4 h-4" />
                  {profile.status}
                </span>
              </div>

              {/* Store Name */}
              <div className="shoppy-inset rounded-2xl p-4 space-y-1">
                <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block">
                  Hub Name
                </span>
                <p className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#006d36]" />
                  <span>{profile.storeName}</span>
                </p>
              </div>

              {/* Owner Name */}
              <div className="shoppy-inset rounded-2xl p-4 space-y-1">
                <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block">
                  Dispatch Officer
                </span>
                <p className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#006d36]" />
                  <span>{profile.ownerName}</span>
                </p>
              </div>

              {/* Mobile */}
              <div className="shoppy-inset rounded-2xl p-4 space-y-1">
                <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block">
                  Official Phone
                </span>
                <p className="text-sm font-mono font-black text-slate-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#006d36]" />
                  <span>{profile.mobile}</span>
                </p>
              </div>

              {/* Email */}
              <div className="shoppy-inset rounded-2xl p-4 space-y-1">
                <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block">
                  Support Email
                </span>
                <p className="text-sm font-mono font-black text-slate-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#006d36]" />
                  <span>{profile.email || "suratparcelhub@aviralifecare.com"}</span>
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="shoppy-inset rounded-2xl p-4 space-y-1">
              <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block">
                Logistics Dispatch Hub Address
              </span>
              <p className="text-xs text-slate-800 font-bold flex items-start gap-2 pt-1">
                <MapPin className="w-4 h-4 text-[#006d36] shrink-0 mt-0.5" />
                <span>
                  {profile.address || "Surat Central Logistics & Parcel Hub, Ring Road"},{" "}
                  {profile.city || "Surat"}, {profile.state || "Gujarat"} - {profile.pincode || "395002"}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </ShoppyLayout>
  );
}
