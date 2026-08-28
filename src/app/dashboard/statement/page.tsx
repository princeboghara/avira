"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  Calendar,
  CheckCircle2,
  Clock,
  Building,
  Loader2,
  FileText,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  Percent,
} from "lucide-react";
import MemberLayout from "@/components/member/MemberLayout";
import DataTable, { Column } from "@/components/ui/DataTable";
import { User } from "@/types";

interface StatementItem {
  id: string;
  srNo: number;
  weekIdentifier: string;
  weekStartDate: string;
  weekEndDate: string;
  weekLabel: string;
  grossAmount: number;
  tdsAmount: number;
  adminCharge: number;
  rpWalletDeduction: number;
  netAmount: number;
  bankName: string;
  bankAccountNumber: string;
  ifscCode: string;
  upiId: string;
  status: "PENDING" | "PAID";
  paidAt?: string;
  transactionReference?: string;
  notes?: string;
}

interface StatementSummary {
  totalPaid: number;
  totalPending: number;
  totalGross: number;
  totalTds: number;
  totalAdmin: number;
  statementCount: number;
}

export default function MemberStatementPage() {
  const [user, setUser] = useState<User | null>(null);
  const [statements, setStatements] = useState<StatementItem[]>([]);
  const [summary, setSummary] = useState<StatementSummary>({
    totalPaid: 0,
    totalPending: 0,
    totalGross: 0,
    totalTds: 0,
    totalAdmin: 0,
    statementCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, stateRes] = await Promise.allSettled([
          fetch("/api/auth/me", { cache: "no-store" }),
          fetch("/api/member/statement", { cache: "no-store" }),
        ]);

        if (meRes.status === "fulfilled") {
          const meData = await meRes.value.json();
          if (meData.success && meData.user) setUser(meData.user);
        }

        if (stateRes.status === "fulfilled") {
          const stateData = await stateRes.value.json();
          if (stateData.success) {
            setStatements(stateData.statements || []);
            if (stateData.summary) setSummary(stateData.summary);
          }
        }
      } catch (err) {
        console.error("Error loading statements:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const columns: Column<StatementItem>[] = [
    {
      header: "Week Period",
      accessorKey: "weekLabel",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#006d36] flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-xs text-[#1a1c1c] block">{row.weekLabel}</span>
            <span className="font-mono text-[10px] text-[#5f5e5e]">{row.weekIdentifier}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Gross Income",
      accessorKey: "grossAmount",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-xs text-[#1a1c1c]">
          ₹{row.grossAmount.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      header: "15% Deductions",
      accessorKey: "tdsAmount",
      cell: (row) => (
        <div className="text-xs font-mono">
          <div className="text-red-600 font-bold">
            -₹{(row.tdsAmount + row.adminCharge).toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-[#5f5e5e]">
            TDS 5%: ₹{row.tdsAmount} • Admin 10%: ₹{row.adminCharge}
          </div>
        </div>
      ),
    },
    {
      header: "Net Payable (85%)",
      accessorKey: "netAmount",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-black text-sm text-[#006d36]">
          ₹{row.netAmount.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      header: "Disbursal Account",
      accessorKey: "bankAccountNumber",
      cell: (row) => (
        <div className="text-xs space-y-0.5">
          <span className="font-semibold text-gray-800 block">{row.bankName || "Linked Bank A/C"}</span>
          <span className="font-mono text-[10px] text-[#5f5e5e] block">
            {row.bankAccountNumber ? `A/C: ${row.bankAccountNumber}` : "Direct Bank Transfer"}
          </span>
        </div>
      ),
    },
    {
      header: "Payout Status",
      accessorKey: "status",
      sortable: true,
      cell: (row) => {
        const isPaid = row.status === "PAID";
        return (
          <div>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                isPaid
                  ? "bg-emerald-100 text-[#006d36] border border-emerald-300"
                  : "bg-amber-100 text-amber-800 border border-amber-300"
              }`}
            >
              {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              <span>{isPaid ? "PAID TO BANK" : "PENDING PAYOUT"}</span>
            </span>
            {isPaid && row.paidAt && (
              <span className="text-[9px] text-gray-500 block font-mono mt-0.5">
                Paid on: {new Date(row.paidAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Reference / Remarks",
      accessorKey: "transactionReference",
      cell: (row) => (
        <div className="font-mono text-[11px] text-[#5f5e5e]">
          {row.transactionReference ? (
            <span className="text-emerald-800 font-semibold">{row.transactionReference}</span>
          ) : (
            <span className="text-gray-400">Scheduled for weekly cutoff</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <MemberLayout user={user}>
      <div className="space-y-8 max-w-7xl mx-auto pb-16 animate-fadeIn">
        {/* Header */}
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#006d36] via-[#005a2c] to-[#4f378a] text-white shadow-xl shadow-[#006d36]/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-200 text-xs font-bold font-mono">
              <FileText className="w-4 h-4" />
              <span>Weekly Settlement & Bank Statements</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Weekly Payout Statement
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl">
              Track your weekly accumulated binary matching bonuses, 15% statutory deductions (5% TDS + 10% Admin Charge), and completed bank transfers.
            </p>
          </div>
        </div>

        {/* 2. SUMMARY METRIC CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-gray-200 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5f5e5e] block">
              Total Lifetime Gross
            </span>
            <span className="text-xl sm:text-2xl font-mono font-black text-[#1a1c1c] block mt-1">
              ₹{summary.totalGross.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-[#5f5e5e] block mt-0.5">
              Accumulated earnings
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-gray-200 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 block">
              15% Deductions (TDS & Admin)
            </span>
            <span className="text-xl sm:text-2xl font-mono font-black text-red-600 block mt-1">
              ₹{(summary.totalTds + summary.totalAdmin).toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-[#5f5e5e] block mt-0.5">
              TDS: ₹{summary.totalTds} • Admin: ₹{summary.totalAdmin}
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-white border border-emerald-200 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#006d36] block">
              Total Paid to Bank
            </span>
            <span className="text-xl sm:text-2xl font-mono font-black text-[#006d36] block mt-1">
              ₹{summary.totalPaid.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-emerald-800 font-medium block mt-0.5">
              Successfully transferred
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-amber-200 bg-amber-50/40 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
              Pending Payout Income
            </span>
            <span className="text-xl sm:text-2xl font-mono font-black text-amber-700 block mt-1">
              ₹{summary.totalPending.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-amber-800 font-medium block mt-0.5">
              Upcoming weekly payout
            </span>
          </div>
        </div>

        {/* 3. WEEK-WISE STATEMENT TABLE */}
        {loading ? (
          <div className="py-20 text-center text-[#006d36] flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-bold font-mono">Loading payout statement...</span>
          </div>
        ) : (
          <DataTable
            data={statements}
            columns={columns}
            keyExtractor={(item) => item.id}
            searchPlaceholder="Search by Week, Reference No, Status..."
            searchableKeys={["weekLabel", "weekIdentifier", "transactionReference", "status"]}
            initialPageSize={10}
            title="Weekly Payout Statement History"
            emptyMessage="No weekly payout statements generated yet."
          />
        )}
      </div>
    </MemberLayout>
  );
}
