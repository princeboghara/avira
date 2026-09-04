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
  Eye,
} from "lucide-react";
import { User, Order } from "@/types";
import MemberLayout from "@/components/member/MemberLayout";
import DataTable, { Column } from "@/components/ui/DataTable";
import OrderItemsModal from "@/components/orders/OrderItemsModal";

export default function PastOrdersPage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"MY_ORDERS" | "OTHERS_ORDERS">("MY_ORDERS");
  const [viewingOrderItems, setViewingOrderItems] = useState<Order | null>(null);

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

  const currentMemberId = (user?.memberId || "").toUpperCase();

  const myOrders = orders.filter((o) => {
    const recId = (o.memberId || "").toUpperCase();
    const billedId = (o.billedBy || "").toUpperCase();
    return recId === currentMemberId || (!o.billedBy && !o.memberId) || (recId === "" && billedId === currentMemberId);
  });

  const othersOrders = orders.filter((o) => {
    const recId = (o.memberId || "").toUpperCase();
    const billedId = (o.billedBy || "").toUpperCase();
    return billedId === currentMemberId && recId !== "" && recId !== currentMemberId;
  });

  const displayOrders = activeTab === "MY_ORDERS" ? myOrders : othersOrders;

  const columns: Column<Order>[] = [
    {
      header: "Order Date",
      accessorKey: "createdAt",
      sortable: true,
      cell: (row) => {
        const d = row.createdAt ? new Date(row.createdAt).toLocaleDateString("en-IN") : "—";
        return <span className="font-mono text-xs text-[#5f5e5e] font-semibold">{d}</span>;
      },
    },
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
      header: "Billed By",
      accessorKey: "billedBy",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-xs text-slate-700">
          {row.billedBy || user?.memberId || "Self"}
        </span>
      ),
    },
    {
      header: "Member ID",
      accessorKey: "memberId",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-black text-xs text-[#006d36]">
          {row.memberId || user?.memberId || "—"}
        </span>
      ),
    },
    {
      header: "Items",
      align: "center",
      cell: (row) => (
        <button
          type="button"
          onClick={() => setViewingOrderItems(row)}
          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#006d36] border border-emerald-200 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Items ({row.items?.length || 1})</span>
        </button>
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
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Page Header */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1 text-xs">
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-[#006d36] font-mono text-[10px] font-black uppercase tracking-wider">
                Shopping Portal
              </span>
              <span className="text-[#5f5e5e] font-bold">
                • Past Orders & Invoices
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#1a1c1c] tracking-tight">
              Order History & Tax Invoices
            </h1>
            <p className="text-xs text-[#5f5e5e] mt-0.5">
              Review placed orders, downline billing, credited Point Volume (PV), and download official GST invoices.
            </p>
          </div>

          <Link
            href="/dashboard/store"
            className="px-4 py-2.5 rounded-xl bg-[#006d36] hover:bg-[#005025] text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-2 self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Place New Order</span>
          </Link>
        </div>

        {/* Tab Navigation: My Orders vs Others Order */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("MY_ORDERS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "MY_ORDERS"
                ? "bg-[#006d36] text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>My Orders ({myOrders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("OTHERS_ORDERS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "OTHERS_ORDERS"
                ? "bg-purple-700 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Others Order ({othersOrders.length})</span>
          </button>
        </div>

        {/* Universal DataTable without Checkbox and without Print */}
        {loading ? (
          <div className="py-16 text-center text-[#006d36] flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-bold font-mono">Loading Order History...</span>
          </div>
        ) : (
          <DataTable
            data={displayOrders}
            columns={columns}
            keyExtractor={(item) => item.id}
            searchPlaceholder="Search orders by Order ID, Billed By, Member ID, Status..."
            searchableKeys={["id", "billedBy", "memberId", "packageName", "status", "customerName"]}
            initialPageSize={10}
            selectable={false}
            showPrint={false}
            showIndex={true}
            title={activeTab === "MY_ORDERS" ? "My Personal Orders" : "Downline Associate Orders"}
            emptyMessage={
              activeTab === "MY_ORDERS"
                ? "No personal orders placed yet. Visit the store to place your first order!"
                : "No orders billed for other associates yet."
            }
          />
        )}
        {/* Order Items Modal */}
        <OrderItemsModal
          order={viewingOrderItems}
          onClose={() => setViewingOrderItems(null)}
        />
      </div>
    </MemberLayout>
  );
}
