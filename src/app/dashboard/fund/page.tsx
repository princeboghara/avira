"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Wallet,
  PlusCircle,
  History,
  QrCode,
  Copy,
  Check,
  Upload,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Building,
  ArrowRight,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ExternalLink,
  X,
  FileText,
  CreditCard,
  Zap,
} from "lucide-react";
import MemberLayout from "@/components/member/MemberLayout";
import { User, FundRequest } from "@/types";
import { openRazorpayCheckout } from "@/lib/razorpayClient";

export default function MemberFundManagerPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "history" ? "history" : "add";

  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"add" | "history">(initialTab);
  const [loading, setLoading] = useState(true);

  // Fund Wallet Balance & Requests History
  const [fundWalletBalance, setFundWalletBalance] = useState<number>(0);
  const [requests, setRequests] = useState<FundRequest[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form States
  const [amount, setAmount] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  const [slipUrl, setSlipUrl] = useState<string>("");

  // Copy helpers
  const [copiedBank, setCopiedBank] = useState(false);
  const [copiedIfsc, setCopiedIfsc] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Lightbox modal for viewing submitted slip
  const [lightboxSlip, setLightboxSlip] = useState<string | null>(null);
  const [slipZoom, setSlipZoom] = useState(1);
  const [slipRotation, setSlipRotation] = useState(0);

  // Company Payment Credentials
  const COMPANY_BANK = {
    bankName: "HDFC BANK LTD",
    accountName: "AVIRA LIFE CARE",
    accountNumber: "50200098451230",
    ifsc: "HDFC0001234",
    branch: "Surat Central Branch, Gujarat",
    upiId: "aviracare@hdfcbank",
  };

  const loadData = async () => {
    try {
      const [meRes, fundRes] = await Promise.all([
        fetch("/api/auth/me", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/member/fund/requests", { cache: "no-store" }).then((r) => r.json()),
      ]);

      if (meRes.success && meRes.user) {
        setUser(meRes.user);
        setFundWalletBalance(Number(meRes.user.fundWallet || 0));
      }

      if (fundRes.success) {
        setRequests(fundRes.requests || []);
        if (fundRes.fundWallet !== undefined) {
          setFundWalletBalance(Number(fundRes.fundWallet));
        }
      }
    } catch (err) {
      console.error("Error loading fund data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopy = (text: string, type: "bank" | "ifsc" | "upi") => {
    navigator.clipboard.writeText(text);
    if (type === "bank") {
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2000);
    } else if (type === "ifsc") {
      setCopiedIfsc(true);
      setTimeout(() => setCopiedIfsc(false), 2000);
    } else if (type === "upi") {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  const handleSlipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setToastMessage({ type: "error", text: "Image size must be less than 5MB." });
      return;
    }

    setUploadingSlip(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ file: base64, folder: "fund_slips" }),
          });
          const data = await res.json();
          if (data.success && data.url) {
            setSlipUrl(data.url);
            setToastMessage({ type: "success", text: "Payment slip uploaded successfully!" });
          } else {
            setToastMessage({ type: "error", text: data.message || "Failed to upload slip." });
          }
        } catch {
          setToastMessage({ type: "error", text: "Error uploading slip image." });
        } finally {
          setUploadingSlip(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadingSlip(false);
      setToastMessage({ type: "error", text: "Failed to read file." });
    }
  };

  const handleSubmitFundRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setToastMessage({ type: "error", text: "Please enter a valid deposit amount (e.g. ₹500, ₹1000)." });
      return;
    }

    if (!transactionId.trim()) {
      setToastMessage({ type: "error", text: "Please enter the Transaction ID / UTR number." });
      return;
    }

    if (!slipUrl.trim()) {
      setToastMessage({ type: "error", text: "Please upload the payment transaction slip / screenshot." });
      return;
    }

    setSubmitting(true);
    setToastMessage(null);

    try {
      const res = await fetch("/api/member/fund/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numAmount,
          transactionId: transactionId.trim(),
          slipUrl: slipUrl.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setToastMessage({
          type: "success",
          text: "Fund request submitted successfully! Admin will verify and credit your Fund Wallet.",
        });
        setAmount("");
        setTransactionId("");
        setSlipUrl("");
        await loadData();
        setActiveTab("history");
      } else {
        setToastMessage({ type: "error", text: data.message || "Failed to submit fund request." });
      }
    } catch {
      setToastMessage({ type: "error", text: "Network error submitting request. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInstantRazorpayDeposit = async () => {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 1) {
      setToastMessage({ type: "error", text: "Please enter a valid deposit amount (min ₹1)." });
      return;
    }

    try {
      setSubmitting(true);
      await openRazorpayCheckout({
        amount: numAmount,
        name: "AVIRA LIFE CARE",
        description: "Fund Wallet Instant Deposit",
        prefill: {
          name: user?.fullName || "",
          contact: user?.mobile || "",
          email: user?.email || "",
        },
        onSuccess: async (data) => {
          try {
            const res = await fetch("/api/member/fund/instant-deposit", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                amount: numAmount,
                razorpay_order_id: data.razorpay_order_id,
                razorpay_payment_id: data.razorpay_payment_id,
                razorpay_signature: data.razorpay_signature,
              }),
            });
            const resData = await res.json();
            if (resData.success) {
              setToastMessage({
                type: "success",
                text: `₹${numAmount.toLocaleString("en-IN")} deposited successfully into your Fund Wallet via Razorpay!`,
              });
              setAmount("");
              await loadData();
              setActiveTab("history");
            } else {
              setToastMessage({ type: "error", text: resData.message || "Failed to credit wallet." });
            }
          } catch {
            setToastMessage({ type: "error", text: "Error verifying deposit on server." });
          } finally {
            setSubmitting(false);
          }
        },
        onFailure: (err) => {
          setSubmitting(false);
          setToastMessage({ type: "error", text: "Razorpay payment cancelled or failed: " + (err?.message || "") });
        },
        onDismiss: () => {
          setSubmitting(false);
        },
      });
    } catch (err: any) {
      setSubmitting(false);
      setToastMessage({ type: "error", text: "Failed to open Razorpay gateway: " + err.message });
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-[#006d36] font-bold text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved & Credited</span>
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-bold text-xs">
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Verification</span>
          </span>
        );
    }
  };

  if (loading) {
    return (
      <MemberLayout user={user}>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-[#006d36]">
          <Loader2 className="w-8 h-8 animate-spin mb-2 text-[#006d36]" />
          <span className="text-xs font-bold font-mono text-[#1a1c1c]">Loading Fund Manager...</span>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout user={user}>
      <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto pb-16">
        {/* Toast Alert */}
        {toastMessage && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold animate-slideIn ${
              toastMessage.type === "success"
                ? "bg-emerald-50 text-[#006d36] border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {toastMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{toastMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ========================================================
            1. FUND WALLET BALANCE HERO CARD
           ======================================================== */}
        <div className="bg-gradient-to-br from-[#006d36] to-[#004d25] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden border border-emerald-600/40">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 text-center md:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 text-xs font-mono font-bold">
              <Wallet className="w-3.5 h-3.5" />
              <span>Associate Fund Wallet</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
              ₹{fundWalletBalance.toLocaleString("en-IN")}
            </h1>
            <p className="text-xs text-emerald-200 max-w-md">
              Use this balance directly at checkout to purchase botanical products, activate packages, or place orders instantly.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 z-10 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab("add")}
              className={`flex-1 md:flex-none px-5 py-3 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "add"
                  ? "bg-[#febd69] text-[#111] hover:bg-[#f3a847]"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Fund</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`flex-1 md:flex-none px-5 py-3 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "history"
                  ? "bg-[#febd69] text-[#111] hover:bg-[#f3a847]"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
              }`}
            >
              <History className="w-4 h-4" />
              <span>Fund History ({requests.length})</span>
            </button>
          </div>
        </div>

        {/* ========================================================
            2. TABS NAVIGATOR
           ======================================================== */}
        <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-2xl max-w-md">
          <button
            type="button"
            onClick={() => setActiveTab("add")}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "add"
                ? "bg-white text-[#006d36] shadow-sm"
                : "text-gray-600 hover:text-[#1a1c1c]"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>1. Deposit / Add Fund</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "history"
                ? "bg-white text-[#006d36] shadow-sm"
                : "text-gray-600 hover:text-[#1a1c1c]"
            }`}
          >
            <History className="w-4 h-4" />
            <span>2. Fund History</span>
          </button>
        </div>

        {/* ========================================================
            TAB 1: ADD FUND
           ======================================================== */}
        {activeTab === "add" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Company Payment Bank Details & QR Code */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-gray-200/90 shadow-2xs space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006d36] flex items-center justify-center font-bold">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1a1c1c]">Official Company Account</h3>
                  <span className="text-[11px] text-gray-500 font-mono">Verified Bank & UPI QR</span>
                </div>
              </div>

              {/* Dynamic QR Code for Scan & Pay */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col items-center justify-center text-center space-y-2">
                <span className="text-[11px] font-bold text-[#006d36] uppercase tracking-wider">
                  Scan & Pay via any UPI App
                </span>
                <div className="w-44 h-44 bg-white p-2.5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                      `upi://pay?pa=${COMPANY_BANK.upiId}&pn=${COMPANY_BANK.accountName}&cu=INR`
                    )}`}
                    alt="Company UPI QR"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex items-center gap-1 text-xs font-mono font-bold text-[#1a1c1c]">
                  <span>{COMPANY_BANK.upiId}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(COMPANY_BANK.upiId, "upi")}
                    className="p-1 rounded-md hover:bg-gray-200 text-gray-500 cursor-pointer"
                    title="Copy UPI ID"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <span className="text-[10px] text-gray-400">GooglePay • PhonePe • Paytm • BHIM</span>
              </div>

              {/* Bank Transfer Details */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Bank Name</span>
                    <strong className="text-[#1a1c1c]">{COMPANY_BANK.bankName}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Account Holder Name</span>
                    <strong className="text-[#1a1c1c]">{COMPANY_BANK.accountName}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Account Number</span>
                    <strong className="text-[#1a1c1c] font-mono">{COMPANY_BANK.accountNumber}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(COMPANY_BANK.accountNumber, "bank")}
                    className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-[#006d36] font-bold text-[10px] hover:bg-emerald-50 cursor-pointer flex items-center gap-1"
                  >
                    {copiedBank ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedBank ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block">IFSC Code</span>
                    <strong className="text-[#1a1c1c] font-mono">{COMPANY_BANK.ifsc}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(COMPANY_BANK.ifsc, "ifsc")}
                    className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-[#006d36] font-bold text-[10px] hover:bg-emerald-50 cursor-pointer flex items-center gap-1"
                  >
                    {copiedIfsc ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIfsc ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Submit Fund Deposit Form */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs space-y-6">
              {/* INSTANT ONLINE DEPOSIT WITH RAZORPAY */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white space-y-3.5 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-emerald-400" />
                    <strong className="text-sm font-black">Instant Online Deposit</strong>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                    No Waiting
                  </span>
                </div>
                <p className="text-xs text-emerald-100/80">
                  Deposit funds directly using UPI, QR, Debit/Credit Card or NetBanking. Funds are credited instantly without manual approval.
                </p>

                <div className="pt-1 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">₹</span>
                    <input
                      type="number"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter Amount (e.g. 500)"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-white text-gray-900 font-mono font-bold text-xs outline-hidden focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleInstantRazorpayDeposit}
                    disabled={submitting || !amount || Number(amount) < 1}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay with Razorpay</span>
                  </button>
                </div>
              </div>

              {/* DIVIDER */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-white px-2">
                  Or Deposit via Manual Bank Transfer
                </span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <div>
                <h3 className="font-black text-base text-[#1a1c1c]">Submit Offline Transfer Slip</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  If you made a direct IMPS/NEFT transfer to the company account, submit your UTR and screenshot slip below.
                </p>
              </div>

              <form onSubmit={handleSubmitFundRequest} className="space-y-4">
                {/* Amount */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#1a1c1c]">
                    Deposit Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-sm font-bold text-gray-400">₹</span>
                    <input
                      type="number"
                      required
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 1000, 2500, 5000"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-mono font-bold text-[#1a1c1c] outline-none focus:bg-white focus:border-[#006d36] focus:ring-2 focus:ring-[#006d36]/10"
                    />
                  </div>
                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    {[500, 1000, 2000, 5000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmount(preset.toString())}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-emerald-50 hover:text-[#006d36] text-[10px] font-mono font-bold text-gray-600 cursor-pointer border border-gray-200 transition-colors"
                      >
                        +₹{preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transaction ID / UTR */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#1a1c1c]">
                    Transaction ID / UTR / Reference No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter 12-digit UTR (e.g. 423589123456)"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono font-bold text-[#1a1c1c] outline-none focus:bg-white focus:border-[#006d36] focus:ring-2 focus:ring-[#006d36]/10 uppercase"
                  />
                  <span className="text-[10px] text-gray-400 block">
                    Found in your GPay / PhonePe / Bank app payment details receipt.
                  </span>
                </div>

                {/* Payment Slip Upload */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#1a1c1c]">
                    Upload Payment Slip / Screenshot <span className="text-red-500">*</span>
                  </label>

                  {slipUrl ? (
                    <div className="relative aspect-[3/2] max-w-sm rounded-2xl bg-gray-50 border-2 border-emerald-300 overflow-hidden p-2 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={slipUrl}
                        alt="Uploaded Slip"
                        className="max-h-full max-w-full rounded-xl object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => setSlipUrl("")}
                        className="absolute top-2 right-2 p-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md cursor-pointer"
                        title="Remove Slip"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-gray-200 hover:border-[#006d36] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-emerald-50/40 cursor-pointer transition-colors">
                      {uploadingSlip ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin text-[#006d36]" />
                          <span className="text-xs font-bold text-[#006d36]">Uploading Slip...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-gray-400" />
                          <span className="text-xs font-bold text-[#1a1c1c]">Click to upload payment screenshot</span>
                          <span className="text-[10px] text-gray-400">JPG, PNG, WebP up to 5MB</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSlipUpload}
                        disabled={uploadingSlip}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting || uploadingSlip}
                    className="w-full py-3 rounded-2xl bg-[#006d36] hover:bg-[#005025] disabled:bg-gray-300 text-white font-black text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Fund Request...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Submit Fund Request for Approval</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: FUND HISTORY
           ======================================================== */}
        {activeTab === "history" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-black text-base text-[#1a1c1c]">Fund Request History</h3>
                <span className="text-xs text-gray-500">Track status of all your deposit requests</span>
              </div>
              <button
                type="button"
                onClick={loadData}
                className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#1a1c1c] font-bold text-xs cursor-pointer flex items-center gap-1"
              >
                Refresh
              </button>
            </div>

            {requests.length === 0 ? (
              <div className="text-center py-12 space-y-2 border border-dashed border-gray-200 rounded-2xl">
                <Wallet className="w-8 h-8 text-gray-300 mx-auto" />
                <h4 className="font-bold text-xs text-[#1a1c1c]">No Fund Requests Found</h4>
                <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                  You haven&apos;t submitted any fund deposit requests yet. Use the &quot;Add Fund&quot; tab to deposit money.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("add")}
                  className="px-4 py-2 rounded-xl bg-[#006d36] text-white font-bold text-xs cursor-pointer hover:bg-[#005025]"
                >
                  Deposit Funds Now
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase text-[10px]">
                      <th className="pb-3 px-2">Request ID</th>
                      <th className="pb-3 px-2">Date & Time</th>
                      <th className="pb-3 px-2">Amount</th>
                      <th className="pb-3 px-2">Transaction ID / UTR</th>
                      <th className="pb-3 px-2">Slip</th>
                      <th className="pb-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-[#1a1c1c]">
                    {requests.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-2 font-mono font-bold text-[11px] text-gray-600">
                          #{r.id.replace("freq_", "").slice(0, 10)}
                        </td>
                        <td className="py-3 px-2 text-gray-500 font-mono text-[11px]">
                          {new Date(r.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3 px-2 font-mono font-black text-sm text-[#006d36]">
                          ₹{r.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-2 font-mono font-bold text-xs uppercase">
                          {r.transactionId}
                        </td>
                        <td className="py-3 px-2">
                          {r.slipUrl ? (
                            <button
                              type="button"
                              onClick={() => {
                                setLightboxSlip(r.slipUrl || null);
                                setSlipZoom(1);
                                setSlipRotation(0);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#006d36] font-bold text-[10px] cursor-pointer flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3" />
                              <span>View Slip</span>
                            </button>
                          ) : (
                            <span className="text-gray-400 text-[10px]">No Slip</span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <div className="space-y-0.5">
                            {getStatusBadge(r.status)}
                            {r.status === "REJECTED" && r.rejectionReason && (
                              <span className="text-[10px] text-red-600 font-semibold block">
                                Reason: {r.rejectionReason}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            3. LIGHTBOX SLIP VIEWER POPUP
           ======================================================== */}
        {lightboxSlip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl border border-emerald-300 space-y-4 animate-scaleUp">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <h3 className="font-black text-base text-[#1a1c1c]">Payment Transaction Slip</h3>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setSlipZoom((z) => Math.max(0.5, z - 0.25))}
                      className="p-1.5 rounded-lg hover:bg-white text-gray-700 cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-mono font-bold px-1.5">{Math.round(slipZoom * 100)}%</span>
                    <button
                      type="button"
                      onClick={() => setSlipZoom((z) => Math.min(3, z + 0.25))}
                      className="p-1.5 rounded-lg hover:bg-white text-gray-700 cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSlipRotation((r) => (r + 90) % 360)}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
                    title="Rotate"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setLightboxSlip(null)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-2xl flex items-center justify-center bg-gray-900/5 max-h-[60vh] overflow-auto select-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={lightboxSlip}
                  alt="Payment Slip"
                  style={{
                    transform: `scale(${slipZoom}) rotate(${slipRotation}deg)`,
                    transition: "transform 0.2s ease-out",
                  }}
                  className="max-h-[50vh] max-w-full rounded-xl object-contain shadow-md"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <a
                  href={lightboxSlip}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-center font-bold text-xs text-[#1a1c1c] flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Full Tab</span>
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxSlip(null)}
                  className="w-full py-2.5 rounded-xl bg-[#006d36] text-white font-bold text-xs cursor-pointer hover:bg-[#005025]"
                >
                  Close Slip Viewer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
