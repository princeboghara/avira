"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  FileText,
  Edit2,
  Trash2,
  X,
  Tag,
  ShoppingBag,
  ArrowRightLeft,
  Eye,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import DataTable, { Column } from "@/components/ui/DataTable";
import OrderItemsModal from "@/components/orders/OrderItemsModal";

interface AdminOrder {
  id: string;
  userId: string;
  billedBy: string;
  memberId: string;
  fullName: string;
  mobile: string;
  transactionId?: string;
  paymentSlip?: string;
  shippingAddress?: string;
  rejectionReason?: string;
  purchaseType: string;
  packageName: string;
  amount: number;
  pv: number;
  items: Array<{
    productId?: string;
    name: string;
    quantity: number;
    mrp: number;
    pv: number;
  }>;
  status: string;
  createdAt: string;
}

export default function AdminAllOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Status Filter Tabs
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // View Items Modal
  const [viewingOrderItems, setViewingOrderItems] = useState<AdminOrder | null>(null);

  // Edit Modal
  const [editingOrderModalOpen, setEditingOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<AdminOrder | null>(null);
  const [orderEditForm, setOrderEditForm] = useState({
    customerName: "",
    customerMobile: "",
    amount: 0,
    pv: 0,
    status: "APPROVED",
  });

  const loadOrders = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/orders", { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.orders) {
        const normalized = data.orders.map((o: AdminOrder) => ({
          ...o,
          amount: Number(o.amount || 0),
          pv: Number(o.pv || 0),
        }));
        setOrders(normalized);
      }
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders();
  }, []);

  const handleOpenEditOrder = (order: AdminOrder) => {
    setEditingOrder(order);
    setOrderEditForm({
      customerName: order.fullName || "",
      customerMobile: order.mobile || "",
      amount: order.amount || 0,
      pv: order.pv || 0,
      status: order.status || "APPROVED",
    });
    setEditingOrderModalOpen(true);
  };

  const handleSaveEditOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    try {
      const res = await fetch(`/api/admin/orders/${editingOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderEditForm),
      });
      const data = await res.json();
      if (data.success) {
        setEditingOrderModalOpen(false);
        await loadOrders();
      } else {
        alert(data.message || "Failed to update order");
      }
    } catch {
      alert("Network error updating order");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm(`Are you sure you want to delete Order #${orderId}? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        await loadOrders();
      } else {
        alert(data.message || "Failed to delete order");
      }
    } catch {
      alert("Network error deleting order");
    }
  };

  const handleBulkDelete = async (selectedIds: string[]) => {
    if (!confirm(`Delete ${selectedIds.length} selected orders?`)) return;
    for (const id of selectedIds) {
      try {
        await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
      } catch {
        // ignore
      }
    }
    await loadOrders();
  };

  const handleQuickTransferToShoppy = async (orderId: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shoppyId: "AVS01" }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Order #${orderId} transferred to Shoppy (SURAT PARCEL HUB) successfully!`);
        await loadOrders();
      } else {
        alert(data.message || "Transfer failed");
      }
    } catch {
      alert("Error transferring order to Shoppy");
    }
  };

  const filteredOrders = statusFilter === "ALL"
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  const columns: Column<AdminOrder>[] = [
    {
      header: "Date",
      accessorKey: "createdAt",
      sortable: true,
      cell: (row) => {
        const d = row.createdAt
          ? new Date(row.createdAt).toLocaleString("en-IN", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—";
        return <span className="font-mono text-xs font-bold text-[#1a1c1c] whitespace-nowrap">{d}</span>;
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
      header: "Associate / Customer",
      accessorKey: "fullName",
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-bold text-[#1a1c1c]">{row.fullName}</div>
          <div className="font-mono text-[10px] text-[#5f5e5e]">
            {row.memberId} • {row.mobile}
          </div>
        </div>
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
          ₹{row.amount.toLocaleString("en-IN")}
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
      header: "Payment Method",
      accessorKey: "transactionId",
      sortable: true,
      align: "center",
      cell: (row) => {
        const isRazorpay =
          row.transactionId?.startsWith("pay_") ||
          row.transactionId?.toLowerCase().includes("rzp") ||
          row.transactionId?.toLowerCase().includes("razorpay");
        const hasSlip = !!row.paymentSlip;

        if (isRazorpay) {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Razorpay Online
            </span>
          );
        }
        if (hasSlip) {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#006d36] border border-emerald-200">
              Bank Slip / QR
            </span>
          );
        }
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            Fund Wallet
          </span>
        );
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
      header: "Actions",
      align: "right",
      sortable: false,
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenEditOrder(row)}
            className="p-1.5 rounded-lg border border-gray-200 text-[#006d36] hover:bg-emerald-50 cursor-pointer"
            title="Edit Order"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteOrder(row.id)}
            className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
            title="Delete Order"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {row.status !== "PENDING" && (
            <>
              <button
                type="button"
                onClick={() => handleQuickTransferToShoppy(row.id)}
                className="p-1.5 px-2 rounded-lg border border-purple-200 text-purple-700 hover:bg-purple-50 cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold"
                title="Transfer to Shoppy (Surat Hub)"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Transfer</span>
              </button>
              <Link
                href={`/slip/${row.id}`}
                target="_blank"
                className="p-1.5 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50 cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold"
                title="Dispatch Slip"
              >
                <Tag className="w-3.5 h-3.5" />
              </Link>
              <Link
                href={`/invoice/${row.id}`}
                target="_blank"
                className="p-1.5 rounded-lg border border-emerald-200 text-[#006d36] hover:bg-emerald-50 cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold"
                title="Tax Invoice"
              >
                <FileText className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminLayout onRefresh={loadOrders} refreshing={refreshing}>
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {/* Neumorphic Header Card */}
        <div className="neo-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-white/80">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full neo-inset text-[#006d36] text-xs font-bold font-mono border border-emerald-200/50">
              <ShoppingBag className="w-4 h-4 text-[#006d36]" />
              <span>Orders Registry & Fulfillment Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0f172a] tracking-tight">
              All Orders Master Registry
            </h1>
            <p className="text-xs sm:text-sm text-[#64748b] max-w-xl font-medium">
              Complete log of all customer and associate orders with live dispatch slips and GST invoice generation.
            </p>
          </div>

          {/* Neumorphic Metric Counters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="neo-inset p-3.5 rounded-2xl text-center min-w-[110px] border border-white/60">
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                Total Orders
              </span>
              <span className="text-xl font-black font-mono text-[#0f172a]">
                {orders.length}
              </span>
            </div>
            <div className="neo-inset p-3.5 rounded-2xl text-center min-w-[110px] border border-white/60">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                Pending
              </span>
              <span className="text-xl font-black font-mono text-amber-900">
                {orders.filter((o) => o.status === "PENDING" || o.status === "PENDING_APPROVAL").length}
              </span>
            </div>
            <div className="neo-inset p-3.5 rounded-2xl text-center min-w-[110px] border border-white/60">
              <span className="text-[10px] font-bold text-[#006d36] uppercase tracking-wider block">
                Confirmed
              </span>
              <span className="text-xl font-black font-mono text-[#006d36]">
                {orders.filter((o) => o.status === "CONFIRMED" || o.status === "APPROVED" || o.status === "COMPLETED").length}
              </span>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {["ALL", "PENDING", "CONFIRMED", "PACKED", "DISPATCHED", "DELIVERED", "REJECTED"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab
                  ? "neo-btn-primary shadow-xs"
                  : "neo-card-flat text-[#64748b] hover:text-[#006d36]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Universal DataTable */}
        {loading ? (
          <div className="py-16 text-center text-[#006d36] flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-bold font-mono">Loading Orders Registry...</span>
          </div>
        ) : (
          <DataTable
            data={filteredOrders}
            columns={columns}
            keyExtractor={(item) => item.id}
            searchPlaceholder="Search by Order ID, Name, Member ID, Mobile..."
            searchableKeys={["id", "fullName", "memberId", "mobile", "status"]}
            initialPageSize={10}
            onBulkDelete={handleBulkDelete}
            title="Orders Ledger"
            emptyMessage="No orders found matching this filter."
          />
        )}

        {/* Edit Modal */}
        {editingOrderModalOpen && editingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-3xs animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-black text-base text-[#1a1c1c]">Edit Order Details</h3>
                  <span className="text-xs font-mono text-[#006d36] font-bold">
                    Order #{editingOrder.id}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingOrderModalOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditOrder} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-[#1a1c1c] mb-1">Customer Full Name:</label>
                  <input
                    type="text"
                    required
                    value={orderEditForm.customerName}
                    onChange={(e) => setOrderEditForm({ ...orderEditForm, customerName: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold text-xs text-[#1a1c1c] outline-hidden focus:border-[#006d36]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1a1c1c] mb-1">Customer Mobile:</label>
                  <input
                    type="text"
                    value={orderEditForm.customerMobile}
                    onChange={(e) => setOrderEditForm({ ...orderEditForm, customerMobile: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-mono text-xs text-[#1a1c1c] outline-hidden focus:border-[#006d36]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1a1c1c] mb-1">Amount (₹):</label>
                    <input
                      type="number"
                      required
                      value={orderEditForm.amount}
                      onChange={(e) => setOrderEditForm({ ...orderEditForm, amount: Number(e.target.value) })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-mono font-bold text-xs text-[#1a1c1c] outline-hidden focus:border-[#006d36]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#1a1c1c] mb-1">PV (Points):</label>
                    <input
                      type="number"
                      required
                      value={orderEditForm.pv}
                      onChange={(e) => setOrderEditForm({ ...orderEditForm, pv: Number(e.target.value) })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-mono font-bold text-xs text-[#1a1c1c] outline-hidden focus:border-[#006d36]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#1a1c1c] mb-1">Order Status:</label>
                  <select
                    value={orderEditForm.status}
                    onChange={(e) => setOrderEditForm({ ...orderEditForm, status: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold text-xs text-[#1a1c1c] outline-hidden focus:border-[#006d36]"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PACKED">PACKED</option>
                    <option value="DISPATCHED">DISPATCHED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>

                <div className="pt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingOrderModalOpen(false)}
                    className="w-full py-2.5 rounded-xl border border-gray-200 text-[#5f5e5e] font-bold text-xs hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#006d36] hover:bg-[#005025] text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Order Items Modal */}
        <OrderItemsModal
          order={viewingOrderItems}
          onClose={() => setViewingOrderItems(null)}
        />
      </div>
    </AdminLayout>
  );
}
