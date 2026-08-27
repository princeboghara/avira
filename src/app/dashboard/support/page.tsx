"use client";

import React, { useEffect, useState } from "react";
import {
  HelpCircle,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import MemberLayout from "@/components/dashboard/MemberLayout";
import { User, SupportTicket } from "@/types";

export default function MemberSupportPage() {
  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  // New Ticket Form State
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Payout & Wallet");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loadTickets = async () => {
    try {
      const res = await fetch("/api/member/support");
      const data = await res.json();
      if (data.success && data.tickets) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error("Error loading tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        if (meData.success && meData.user) {
          setUser(meData.user);
        }
      } catch {
        // ignore
      }
      await loadTickets();
    }
    loadData();
  }, []);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setErrorMsg("Please fill in both subject and query message.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/member/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          category,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Your query has been submitted! Our support team will respond shortly.");
        setSubject("");
        setMessage("");
        await loadTickets();
      } else {
        setErrorMsg(data.message || "Failed to submit support ticket.");
      }
    } catch {
      setErrorMsg("Network error submitting ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <MemberLayout user={user}>
      <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto pb-12">
        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-[#006d36] font-mono text-[10px] font-black uppercase tracking-wider">
                Support Portal
              </span>
              <span className="text-xs text-[#5f5e5e] font-medium">
                Customer Care & Inquiry Desk
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1a1c1c] tracking-tight">
              Help Desk & Ticket Center
            </h1>
            <p className="text-xs text-[#5f5e5e] mt-1">
              Have questions regarding KYC, Binary Matching, Payouts, or Products? Raise a ticket and get an official reply from Admin.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center min-w-[90px]">
              <span className="text-[10px] font-bold text-[#006d36] uppercase block">My Tickets</span>
              <span className="text-xl font-black font-mono text-[#006d36]">{tickets.length}</span>
            </div>
          </div>
        </div>

        {/* Submit Ticket Form */}
        <form onSubmit={handleSubmitTicket} className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#e2e2e2]">
            <MessageSquare className="w-5 h-5 text-[#006d36]" />
            <div>
              <h2 className="text-base font-black text-[#1a1c1c]">
                Submit a Support Query
              </h2>
              <span className="text-xs text-[#5f5e5e]">
                Direct channel to the Avira Life Care administrative desk
              </span>
            </div>
          </div>

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-[#006d36] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                Query Category *
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-3 text-xs font-medium text-[#1a1c1c] appearance-none outline-none focus:border-[#006d36] cursor-pointer"
                >
                  <option value="Payout & Wallet">Payout & Wallet Withdrawal</option>
                  <option value="KYC & Verification">KYC & Document Verification</option>
                  <option value="Orders & Products">Orders & Product Delivery</option>
                  <option value="Binary Matching & PV">Binary PV Matching & Genealogy</option>
                  <option value="General Inquiry">General Account Inquiry</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                Subject Title *
              </label>
              <input
                type="text"
                placeholder="Brief summary of your inquiry..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-3 text-xs font-medium text-[#1a1c1c] outline-none focus:border-[#006d36]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-xs text-[#1a1c1c] uppercase tracking-wider mb-1.5">
              Detailed Query Message *
            </label>
            <textarea
              rows={4}
              placeholder="Describe your issue or query clearly with transaction ID, member ID or relevant specifics..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-3 text-xs font-medium text-[#1a1c1c] outline-none focus:border-[#006d36]"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-2xl bg-[#006d36] hover:bg-[#005025] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#006d36]/20 cursor-pointer disabled:opacity-60 transition-all flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Query...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Support Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Previous Support Queries List */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e2e2] shadow-xs space-y-4">
          <h2 className="text-base font-black text-[#1a1c1c] pb-3 border-b border-[#e2e2e2]">
            My Submitted Tickets ({tickets.length})
          </h2>

          {loading ? (
            <div className="py-8 text-center text-[#006d36]">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <span className="text-xs font-bold">Loading support history...</span>
            </div>
          ) : tickets.length === 0 ? (
            <div className="py-8 text-center text-[#5f5e5e] text-xs">
              You have not submitted any queries yet. Use the form above if you require assistance.
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((tkt) => (
                <div
                  key={tkt.id}
                  className="p-4 sm:p-5 rounded-2xl border border-[#e2e2e2] bg-[#f9f9f9] space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-[#006d36]">
                        {tkt.id}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-white border border-[#e2e2e2] text-[#5f5e5e]">
                        {tkt.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#5f5e5e]">
                        {formatDateTime(tkt.createdAt)}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                          tkt.status === "RESOLVED"
                            ? "bg-emerald-100 text-[#006d36] border-emerald-300"
                            : "bg-amber-100 text-amber-900 border-amber-300"
                        }`}
                      >
                        {tkt.status === "RESOLVED" ? (
                          <CheckCircle2 className="w-3 h-3 text-[#006d36]" />
                        ) : (
                          <Clock className="w-3 h-3 text-amber-700" />
                        )}
                        <span>{tkt.status}</span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-[#1a1c1c]">{tkt.subject}</h3>
                    <p className="text-xs text-[#5f5e5e] mt-1 leading-relaxed whitespace-pre-wrap">
                      {tkt.message}
                    </p>
                  </div>

                  {/* Admin Official Response Box */}
                  {tkt.adminResponse ? (
                    <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-300 space-y-1 mt-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#006d36]">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Avira Help Desk Response:</span>
                        {tkt.resolvedAt && (
                          <span className="text-[10px] text-[#5f5e5e] font-normal ml-auto">
                            Answered on {formatDateTime(tkt.resolvedAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#1a1c1c] font-medium leading-relaxed pl-5 whitespace-pre-wrap">
                        {tkt.adminResponse}
                      </p>
                    </div>
                  ) : (
                    <div className="text-[11px] text-amber-800 font-medium flex items-center gap-1 pt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Ticket is in queue with administrative support team.</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MemberLayout>
  );
}
