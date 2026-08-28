"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Package,
  PlusCircle,
  FileText,
  Printer,
  ShoppingBag,
} from "lucide-react";
import { User, Order } from "@/types";
import MemberLayout from "@/components/member/MemberLayout";
import DataTable, { Column } from "@/components/ui/DataTable";

export default function PastOrdersPage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const [meRes, ordersRes] = await Promise.all([
          fetch("/api/auth/me", { cache: "no-store" }),
          fetch("/api/orders", { cache: "no-store" }),
        ]);

        const meData = await meRes.json();
        if (meData.success && meData.user) {
          setUser(meData.user);
        }

        const ordersData = await ordersRes.json();
        if (ordersData.success && ordersData.orders) {
          setOrders(ordersData.orders);
        }
      } catch (err) {
        console.error("Error loading past orders:", err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const columns: Column<Order>[] = [
    {
      header: "Order ID",
      accessorKey: "id",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-xs text-[#006d36]">
          #{row.id}
        </span>
      ),
    },
    {
      header: "Package / Items",
      accessorKey: "packageName",
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-bold text-[#1a1c1c] text-xs">
            {row.packageName || `${row.items?.length || 1} Botanical Item(s)`}
          </div>
          <div className="text-[10px] text-[#5f5e5e] font-mono">
            {row.customerName ? `Recipient: ${row.customerName}` : ""}
          </div>
        </div>
      ),
    },
    {
      header: "Amount",
      accessorKey: "amount",
      sortable: true,
      align: "right",
      cell: (row) => (
        <span className="font-mono font-black text-xs text-[#1a1c1c]">
          ₹{row.amount?.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      header: "Point Volume",
      accessorKey: "pv",
      sortable: true,
      align: "center",
      cell: (row) => (
        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
          {row.pv} PV
        </span>
      ),
    },
    {
      header: "Order Date",
      accessorKey: "createdAt",
      sortable: true,
      cell: (row) => {
        const d = row.createdAt ? new Date(row.createdAt).toLocaleDateString("en-IN") : "—";
        return <span className="font-mono text-xs text-[#5f5e5e]">{d}</span>;
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      align: "center",
      cell: (row) => {
        const s = row.status;
        const color =
          s === "CONFIRMED" || s === "APPROVED" || s === "COMPLETED"
            ? "bg-emerald-100 text-[#006d36]"
            : s === "PACKED"
            ? "bg-indigo-100 text-indigo-800"
            : s === "DISPATCHED"
            ? "bg-blue-100 text-blue-800"
            : s === "REJECTED"
            ? "bg-red-100 text-red-700"
            : "bg-amber-100 text-amber-800";

        return (
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${color}`}>
            {s}
          </span>
        );
      },
    },
    {
      header: "Invoice / Slip",
      align: "right",
      sortable: false,
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/invoice/${row.id}`}
            target="_blank"
            className="px-2.5 py-1 rounded-lg border border-emerald-200 text-[#006d36] hover:bg-emerald-50 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Invoice</span>
          </Link>
          <Link
            href={`/invoice/${row.id}?print=1`}
            target="_blank"
            className="p-1 rounded-lg border border-gray-200 text-[#5f5e5e] hover:bg-gray-100"
            title="Print Tax Invoice"
          >
            <Printer className="w-3.5 h-3.5" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <MemberLayout user={user}>
      <div className="space-y-8 max-w-6xl mx-auto pb-12">
        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-[#006d36] font-mono text-[10px] font-black uppercase tracking-wider">
                Shopping Portal
              </span>
              <span className="text-xs text-[#5f5e5e] font-medium">
                Past Orders & Invoices
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1a1c1c] tracking-tight">
              Order History & Tax Invoices
            </h1>
            <p className="text-xs text-[#5f5e5e] mt-1">
              Review placed orders, shipping statuses, credited Point Volume (PV), and download official GST invoices.
            </p>
          </div>

          <Link
            href="/dashboard/store"
            className="px-5 py-3 rounded-2xl bg-[#006d36] hover:bg-[#005025] text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Place New Order</span>
          </Link>
        </div>

        {/* Universal DataTable */}
        {loading ? (
          <div className="py-16 text-center text-[#006d36] flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-bold font-mono">Loading Order History...</span>
          </div>
        ) : (
          <DataTable
            data={orders}
            columns={columns}
            keyExtractor={(item) => item.id}
            searchPlaceholder="Search orders by Order ID, Item name, Status..."
            searchableKeys={["id", "packageName", "status", "customerName"]}
            initialPageSize={10}
            title="Past Orders Registry"
            emptyMessage="No orders placed yet. Visit the store to place your first order!"
          />
        )}
      </div>
    </MemberLayout>
  );
}
