"use client";

import React from "react";
import { History, ArrowDownLeft, ArrowUpRight, CheckCircle2, Clock } from "lucide-react";
import { Transaction } from "@/types";

export default function TransactionHistory({
  transactions = [],
}: {
  transactions: Transaction[];
}) {
  return (
    <div className="glass-white rounded-3xl p-6 sm:p-8 border border-emerald-500/20 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-700" />
          <h3 className="text-xl font-black text-[#022c22] tracking-tight">
            Financial Ledger & Payout History
          </h3>
        </div>
        <span className="text-xs text-emerald-800 font-semibold bg-emerald-100 px-3 py-1 rounded-full">
          Double-Entry Ledger Audited
        </span>
      </div>

      <div className="space-y-3">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-xs text-emerald-800">
            No transactions found yet. Refer your first associate to see instant commission credits!
          </div>
        ) : (
          transactions.map((tx) => {
            const isCredit = tx.type !== "WITHDRAWAL";
            return (
              <div
                key={tx.id}
                className="p-4 rounded-2xl bg-white border border-emerald-100 hover:border-emerald-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isCredit
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {isCredit ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-[#022c22] uppercase tracking-wide">
                        {tx.type.replace("_", " ")}
                      </span>
                      <span className="text-[10px] text-emerald-800/80 font-mono">
                        #{tx.id}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-950/80 mt-0.5">{tx.description}</p>
                    <span className="text-[10px] text-emerald-700/70 font-mono">{tx.date}</span>
                  </div>
                </div>

                <div className="text-right sm:flex-shrink-0 self-end sm:self-center">
                  <div
                    className={`text-base font-black font-mono ${
                      isCredit ? "text-emerald-700" : "text-amber-700"
                    }`}
                  >
                    {isCredit ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                  </div>
                  <div className="flex items-center gap-1 justify-end mt-0.5">
                    {tx.status === "COMPLETED" ? (
                      <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        <span>Processing</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
