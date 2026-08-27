"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  HelpCircle,
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  Send,
  Loader2,
  X,
  User,
  Filter,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { SupportTicket } from "@/types";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "RESOLVED">("OPEN");
  const [searchQuery, setSearchQuery] = useState("");

  // Reply Modal
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const loadTickets = async () => {
    try {
      const res = await fetch("/api/admin/support");
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
    loadTickets();
  }, []);

  const openCount = useMemo(() => tickets.filter((t) => t.status === "OPEN").length, [tickets]);
  const resolvedCount = useMemo(() => tickets.filter((t) => t.status === "RESOLVED").length, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((tkt) => {
      const matchStatus = statusFilter === "ALL" || tkt.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (tkt.id || "").toLowerCase().includes(q) ||
        (tkt.memberId || "").toLowerCase().includes(q) ||
        (tkt.fullName || "").toLowerCase().includes(q) ||
        (tkt.subject || "").toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [tickets, statusFilter, searchQuery]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    setSendingReply(true);
    try {
      const res = await fetch("/api/admin/support", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          adminResponse: replyText.trim(),
          status: "RESOLVED",
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Response sent to associate successfully!");
        setSelectedTicket(null);
        setReplyText("");
        await loadTickets();
      } else {
        alert(data.message || "Failed to send response.");
      }
    } catch {
      alert("Error sending response.");
    } finally {
      setSendingReply(false);
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
    <AdminLayout onRefresh={loadTickets}>
      <div className="space-y-6 animate-fadeIn">
        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-[#006d36] font-mono text-[10px] font-black uppercase tracking-wider">
                Admin Support
              </span>
              <span className="text-xs text-[#5f5e5e] font-medium">
                Help Desk Manager
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1a1c1c] tracking-tight">
              Member Inquiries & Support Tickets
            </h1>
            <p className="text-xs text-[#5f5e5e] mt-1">
              Review and reply to inquiries from associates regarding orders, commissions, payouts, and verifications.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center min-w-[90px]">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">Pending</span>
              <span className="text-xl font-black font-mono text-amber-900">{openCount}</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center min-w-[90px]">
              <span className="text-[10px] font-bold text-[#006d36] uppercase block">Resolved</span>
              <span className="text-xl font-black font-mono text-[#006d36]">{resolvedCount}</span>
            </div>
          </div>
        </div>

        {/* Table & Filters Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e2e2] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-[#e2e2e2]">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2]">
              <button
                type="button"
                onClick={() => setStatusFilter("OPEN")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === "OPEN"
                    ? "bg-[#006d36] text-white shadow-xs"
                    : "text-[#5f5e5e] hover:text-[#006d36]"
                }`}
              >
                <span>Pending</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${statusFilter === "OPEN" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-900"}`}>
                  {openCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("RESOLVED")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === "RESOLVED"
                    ? "bg-[#006d36] text-white shadow-xs"
                    : "text-[#5f5e5e] hover:text-[#006d36]"
                }`}
              >
                <span>Resolved</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${statusFilter === "RESOLVED" ? "bg-white/20 text-white" : "bg-gray-200 text-[#5f5e5e]"}`}>
                  {resolvedCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === "ALL"
                    ? "bg-[#006d36] text-white shadow-xs"
                    : "text-[#5f5e5e] hover:text-[#006d36]"
                }`}
              >
                All
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[280px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search ticket ID, member ID, name, subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl py-2 pl-10 pr-4 text-xs font-medium text-[#1a1c1c] outline-none focus:border-[#006d36]"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-[#e2e2e2]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#f9f9f9] border-b border-[#e2e2e2] text-[#5f5e5e] uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4">Ticket ID</th>
                  <th className="py-3.5 px-4">Associate</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Subject & Query</th>
                  <th className="py-3.5 px-4">Submitted Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e2e2]/60 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#006d36]">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <span>Loading support tickets...</span>
                    </td>
                  </tr>
                ) : filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#5f5e5e]">
                      No support tickets found for the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((tkt) => (
                    <tr key={tkt.id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#006d36] whitespace-nowrap">
                        {tkt.id}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-sm text-[#1a1c1c] block">{tkt.fullName}</span>
                        <span className="font-mono text-[11px] text-[#006d36] font-bold block">{tkt.memberId}</span>
                        {tkt.mobile && <span className="font-mono text-[10px] text-[#5f5e5e]">{tkt.mobile}</span>}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 border border-gray-200 text-[#5f5e5e]">
                          {tkt.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="font-bold text-xs text-[#1a1c1c] block truncate">
                          {tkt.subject}
                        </span>
                        <span className="text-[11px] text-[#5f5e5e] line-clamp-2 mt-0.5">
                          {tkt.message}
                        </span>
                        {tkt.adminResponse && (
                          <div className="mt-1 p-1.5 bg-emerald-50 rounded-lg border border-emerald-200 text-[10px] text-[#006d36]">
                            <strong>Reply:</strong> {tkt.adminResponse}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-[#5f5e5e]">
                        {formatDateTime(tkt.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
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
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTicket(tkt);
                            setReplyText(tkt.adminResponse || "");
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#006d36] hover:bg-[#005025] text-white text-[11px] font-bold shadow-xs cursor-pointer inline-flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{tkt.adminResponse ? "Edit Reply" : "Reply"}</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-emerald-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e2e2]">
              <div>
                <h3 className="font-black text-base text-[#1a1c1c]">
                  Reply to Support Ticket: {selectedTicket.id}
                </h3>
                <span className="text-xs text-[#5f5e5e]">
                  Associate: {selectedTicket.fullName} ({selectedTicket.memberId})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ticket Subject & Message */}
            <div className="p-3.5 bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2] space-y-1.5 text-xs">
              <div className="flex items-center justify-between font-bold text-[#1a1c1c]">
                <span>Category: {selectedTicket.category}</span>
                <span className="text-[#5f5e5e]">{formatDateTime(selectedTicket.createdAt)}</span>
              </div>
              <p className="font-bold text-[#006d36]">{selectedTicket.subject}</p>
              <p className="text-[#5f5e5e] whitespace-pre-wrap leading-relaxed">
                {selectedTicket.message}
              </p>
            </div>

            {/* Admin Response Form */}
            <form onSubmit={handleSendReply} className="space-y-3">
              <div>
                <label className="block font-bold text-xs text-[#1a1c1c] uppercase tracking-wider mb-1.5">
                  Official Administrative Response *
                </label>
                <textarea
                  rows={4}
                  placeholder="Type clear resolution or guidance for the associate..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  required
                  className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-3 text-xs text-[#1a1c1c] outline-none focus:border-[#006d36]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-[#e2e2e2] text-xs font-bold text-[#5f5e5e] hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingReply}
                  className="w-1/2 py-2.5 rounded-xl bg-[#006d36] hover:bg-[#005025] text-white text-xs font-bold cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5 shadow-md shadow-[#006d36]/20"
                >
                  {sendingReply ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Reply</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
