"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Loader2,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Search,
  Edit2,
  Trash2,
  X,
  Package,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

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
    subtotalMrp?: number;
    subtotalPv?: number;
  }>;
  status: string;
  createdAt: string;
}

export default function AdminAllOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Status Filter Tabs (Default is 'APPROVED' as requested)
  const [statusFilter, setStatusFilter] = useState<
    "APPROVED" | "COMPLETED" | "ALL" | "PENDING"
  >("APPROVED");

  const [searchQuery, setSearchQuery] = useState("");

  // Sorting
  const [sortColumn, setSortColumn] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Modals
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<AdminOrder | null>(null);
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
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data.success && data.orders) {
        const normalized = data.orders.map((o: any) => ({
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
    loadOrders();
  }, []);

  const approvedOrdersList = useMemo(
    () => orders.filter((ord) => ord.status === "APPROVED"),
    [orders]
  );
  const completedOrdersList = useMemo(
    () => orders.filter((ord) => ord.status === "COMPLETED"),
    [orders]
  );
  const pendingOrdersList = useMemo(
    () =>
      orders.filter(
        (ord) => ord.status === "PENDING" || ord.status === "PENDING_APPROVAL"
      ),
    [orders]
  );

  const displayedOrders = useMemo(() => {
    let list = orders;
    if (statusFilter === "APPROVED") {
      list = approvedOrdersList;
    } else if (statusFilter === "COMPLETED") {
      list = completedOrdersList;
    } else if (statusFilter === "PENDING") {
      list = pendingOrdersList;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (ord) =>
          ord.id.toLowerCase().includes(q) ||
          (ord.billedBy && ord.billedBy.toLowerCase().includes(q)) ||
          ord.memberId.toLowerCase().includes(q) ||
          ord.fullName.toLowerCase().includes(q) ||
          (ord.mobile && ord.mobile.includes(q))
      );
    }

    return [...list].sort((a, b) => {
      let valA: any = "";
      let valB: any = "";

      switch (sortColumn) {
        case "createdAt":
          valA = new Date(a.createdAt).getTime();
          valB = new Date(b.createdAt).getTime();
          break;
        case "billedBy":
          valA = (a.billedBy || a.memberId).toLowerCase();
          valB = (b.billedBy || b.memberId).toLowerCase();
          break;
        case "memberId":
          valA = a.memberId.toLowerCase();
          valB = b.memberId.toLowerCase();
          break;
        case "fullName":
          valA = a.fullName.toLowerCase();
          valB = b.fullName.toLowerCase();
          break;
        case "mobile":
          valA = a.mobile || "";
          valB = b.mobile || "";
          break;
        case "pv":
          valA = a.pv;
          valB = b.pv;
          break;
        case "amount":
          valA = a.amount;
          valB = b.amount;
          break;
        case "status":
          valA = (a.status || "").toLowerCase();
          valB = (b.status || "").toLowerCase();
          break;
        default:
          valA = new Date(a.createdAt).getTime();
          valB = new Date(b.createdAt).getTime();
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [
    orders,
    statusFilter,
    approvedOrdersList,
    completedOrdersList,
    pendingOrdersList,
    searchQuery,
    sortColumn,
    sortDirection,
  ]);

  const handleOrderSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleMarkCompleted = async (orderId: string) => {
    if (!confirm(`Mark Order #${orderId} as COMPLETED?`)) return;

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Order marked as Completed!");
        await loadOrders();
      } else {
        alert(data.message || "Failed to complete order.");
      }
    } catch {
      alert("Error updating order status.");
    }
  };

  const handleOpenEditOrder = (ord: AdminOrder) => {
    setEditingOrder(ord);
    setOrderEditForm({
      customerName: ord.fullName,
      customerMobile: ord.mobile || "",
      amount: ord.amount,
      pv: ord.pv,
      status: ord.status,
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
        body: JSON.stringify({
          customerName: orderEditForm.customerName.trim(),
          customerMobile: orderEditForm.customerMobile.trim(),
          amount: Number(orderEditForm.amount),
          pv: Number(orderEditForm.pv),
          status: orderEditForm.status,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingOrderModalOpen(false);
        setEditingOrder(null);
        await loadOrders();
        alert("Order updated successfully!");
      } else {
        alert(data.message || "Failed to update order.");
      }
    } catch {
      alert("Error updating order.");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm(`Are you sure you want to permanently delete Order #${orderId}? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        alert("Order deleted successfully.");
        await loadOrders();
      } else {
        alert(data.message || "Failed to delete order.");
      }
    } catch {
      alert("Error deleting order.");
    }
  };

  return (
    <AdminLayout onRefresh={loadOrders} refreshing={refreshing}>
      <div className="space-y-6 animate-fadeIn">
        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-[#006d36] font-mono text-[10px] font-black uppercase tracking-wider">
                Order Registry
              </span>
              <span className="text-xs text-[#5f5e5e] font-medium">
                Order Manager • 1. All Orders
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1a1c1c] tracking-tight">
              All Orders Audit Directory
            </h1>
            <p className="text-xs text-[#5f5e5e] mt-1">
              Official ledger of all associate product orders. Click any column header to sort ascending or descending.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center min-w-[110px]">
              <span className="text-[10px] font-bold text-[#006d36] uppercase block">Approved</span>
              <span className="text-xl font-black font-mono text-[#006d36]">{approvedOrdersList.length}</span>
            </div>
            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 text-center min-w-[110px]">
              <span className="text-[10px] font-bold text-blue-700 uppercase block">Completed</span>
              <span className="text-xl font-black font-mono text-blue-800">{completedOrdersList.length}</span>
            </div>
          </div>
        </div>

        {/* Orders Table Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e2e2] shadow-xs space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#e2e2e2]">
            {/* Status Filter Tabs (Default: APPROVED) */}
            <div className="flex items-center gap-1.5 p-1 bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2] overflow-x-auto">
              <button
                type="button"
                onClick={() => setStatusFilter("APPROVED")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  statusFilter === "APPROVED"
                    ? "bg-[#006d36] text-white shadow-xs"
                    : "text-[#5f5e5e] hover:text-[#006d36]"
                }`}
              >
                <span>Approved Orders</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    statusFilter === "APPROVED"
                      ? "bg-white/20 text-white"
                      : "bg-gray-200 text-[#5f5e5e]"
                  }`}
                >
                  {approvedOrdersList.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("COMPLETED")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  statusFilter === "COMPLETED"
                    ? "bg-[#006d36] text-white shadow-xs"
                    : "text-[#5f5e5e] hover:text-[#006d36]"
                }`}
              >
                <span>Completed Orders</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    statusFilter === "COMPLETED"
                      ? "bg-white/20 text-white"
                      : "bg-gray-200 text-[#5f5e5e]"
                  }`}
                >
                  {completedOrdersList.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  statusFilter === "ALL"
                    ? "bg-[#006d36] text-white shadow-xs"
                    : "text-[#5f5e5e] hover:text-[#006d36]"
                }`}
              >
                <span>All Orders</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    statusFilter === "ALL"
                      ? "bg-white/20 text-white"
                      : "bg-gray-200 text-[#5f5e5e]"
                  }`}
                >
                  {orders.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("PENDING")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  statusFilter === "PENDING"
                    ? "bg-[#006d36] text-white shadow-xs"
                    : "text-[#5f5e5e] hover:text-[#006d36]"
                }`}
              >
                <span>Pending Orders</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    statusFilter === "PENDING"
                      ? "bg-white/20 text-white"
                      : "bg-gray-200 text-[#5f5e5e]"
                  }`}
                >
                  {pendingOrdersList.length}
                </span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Order ID, Billed By, Member, Mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl py-2.5 pl-10 pr-4 text-xs text-[#1a1c1c] placeholder-gray-400 focus:border-[#006d36] outline-none font-medium"
              />
            </div>
          </div>

          {/* Table with Clickable Sorting Columns */}
          <div className="overflow-x-auto rounded-xl border border-[#e2e2e2]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#f9f9f9] border-b border-[#e2e2e2] text-[#5f5e5e] uppercase tracking-wider font-bold">
                <tr>
                  <th
                    onClick={() => handleOrderSort("srNo")}
                    className="py-3.5 px-4 cursor-pointer select-none hover:text-[#006d36] transition-colors"
                    title="Click to sort by Sr No"
                  >
                    <div className="flex items-center gap-1">
                      <span>Sr No</span>
                      {sortColumn === "srNo" && (
                        <span className="text-[#006d36] font-black">
                          {sortDirection === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </div>
                  </th>

                  <th
                    onClick={() => handleOrderSort("createdAt")}
                    className="py-3.5 px-4 cursor-pointer select-none hover:text-[#006d36] transition-colors"
                    title="Click to sort by Order Date"
                  >
                    <div className="flex items-center gap-1">
                      <span>Order Date</span>
                      {sortColumn === "createdAt" && (
                        <span className="text-[#006d36] font-black">
                          {sortDirection === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </div>
                  </th>

                  <th
                    onClick={() => handleOrderSort("billedBy")}
                    className="py-3.5 px-4 cursor-pointer select-none hover:text-[#006d36] transition-colors"
                    title="Click to sort by Billed By"
                  >
                    <div className="flex items-center gap-1">
                      <span>Billed By</span>
                      {sortColumn === "billedBy" && (
                        <span className="text-[#006d36] font-black">
                          {sortDirection === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </div>
                  </th>

                  <th
                    onClick={() => handleOrderSort("memberId")}
                    className="py-3.5 px-4 cursor-pointer select-none hover:text-[#006d36] transition-colors"
                    title="Click to sort by Member ID"
                  >
                    <div className="flex items-center gap-1">
                      <span>Member ID</span>
                      {sortColumn === "memberId" && (
                        <span className="text-[#006d36] font-black">
                          {sortDirection === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </div>
                  </th>

                  <th
                    onClick={() => handleOrderSort("fullName")}
                    className="py-3.5 px-4 cursor-pointer select-none hover:text-[#006d36] transition-colors"
                    title="Click to sort by Name"
                  >
                    <div className="flex items-center gap-1">
                      <span>Name</span>
                      {sortColumn === "fullName" && (
                        <span className="text-[#006d36] font-black">
                          {sortDirection === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </div>
                  </th>

                  <th
                    onClick={() => handleOrderSort("mobile")}
                    className="py-3.5 px-4 cursor-pointer select-none hover:text-[#006d36] transition-colors"
                    title="Click to sort by Mobile"
                  >
                    <div className="flex items-center gap-1">
                      <span>Mobile</span>
                      {sortColumn === "mobile" && (
                        <span className="text-[#006d36] font-black">
                          {sortDirection === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </div>
                  </th>

                  <th
                    onClick={() => handleOrderSort("pv")}
                    className="py-3.5 px-4 cursor-pointer select-none hover:text-[#006d36] transition-colors"
                    title="Click to sort by PV"
                  >
                    <div className="flex items-center gap-1">
                      <span>PV</span>
                      {sortColumn === "pv" && (
                        <span className="text-[#006d36] font-black">
                          {sortDirection === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </div>
                  </th>

                  <th
                    onClick={() => handleOrderSort("amount")}
                    className="py-3.5 px-4 cursor-pointer select-none hover:text-[#006d36] transition-colors"
                    title="Click to sort by Amount"
                  >
                    <div className="flex items-center gap-1">
                      <span>Amount (₹)</span>
                      {sortColumn === "amount" && (
                        <span className="text-[#006d36] font-black">
                          {sortDirection === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </div>
                  </th>

                  <th
                    onClick={() => handleOrderSort("status")}
                    className="py-3.5 px-4 cursor-pointer select-none hover:text-[#006d36] transition-colors"
                    title="Click to sort by Status"
                  >
                    <div className="flex items-center gap-1">
                      <span>Status</span>
                      {sortColumn === "status" && (
                        <span className="text-[#006d36] font-black">
                          {sortDirection === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </div>
                  </th>

                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e2e2]/60 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-[#006d36]">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <span>Loading order records...</span>
                    </td>
                  </tr>
                ) : displayedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-[#5f5e5e]">
                      No orders found for the selected filter.
                    </td>
                  </tr>
                ) : (
                  displayedOrders.map((ord, idx) => {
                    const formattedDate = ord.createdAt
                      ? new Date(ord.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Recent";

                    return (
                      <tr key={ord.id} className="hover:bg-emerald-50/30 transition-colors">
                        {/* Sr No */}
                        <td className="py-3.5 px-4 font-mono font-bold text-[#5f5e5e]">
                          {idx + 1}
                        </td>

                        {/* Order Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-mono text-xs text-[#1a1c1c] block">
                            {formattedDate}
                          </span>
                          <span className="text-[10px] text-[#5f5e5e] font-mono block">
                            #{ord.id}
                          </span>
                        </td>

                        {/* Billed By */}
                        <td className="py-3.5 px-4 font-mono font-bold text-[#006d36]">
                          {ord.billedBy || ord.memberId}
                        </td>

                        {/* Member ID */}
                        <td className="py-3.5 px-4 font-mono font-black text-[#1a1c1c]">
                          {ord.memberId}
                        </td>

                        {/* Name (Customer) */}
                        <td className="py-3.5 px-4 font-bold text-sm text-[#1a1c1c]">
                          {ord.fullName}
                        </td>

                        {/* Mobile */}
                        <td className="py-3.5 px-4 font-mono text-[#5f5e5e]">
                          {ord.mobile || "—"}
                        </td>

                        {/* PV */}
                        <td className="py-3.5 px-4 font-mono font-black text-[#006d36] whitespace-nowrap">
                          +{ord.pv} PV
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4 font-mono font-black text-sm text-[#1a1c1c] whitespace-nowrap">
                          ₹{Number(ord.amount || 0).toLocaleString("en-IN")}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                              ord.status === "COMPLETED"
                                ? "bg-emerald-100 text-[#006d36] border-emerald-300"
                                : ord.status === "APPROVED"
                                ? "bg-blue-100 text-blue-800 border-blue-300"
                                : ord.status === "REJECTED"
                                ? "bg-red-100 text-red-700 border-red-300"
                                : "bg-amber-100 text-amber-800 border-amber-300"
                            }`}
                          >
                            {ord.status === "COMPLETED" ? (
                              <CheckCircle className="w-3 h-3 text-[#006d36]" />
                            ) : ord.status === "APPROVED" ? (
                              <CheckCircle2 className="w-3 h-3 text-blue-700" />
                            ) : ord.status === "REJECTED" ? (
                              <XCircle className="w-3 h-3 text-red-600" />
                            ) : (
                              <Clock className="w-3 h-3 text-amber-700" />
                            )}
                            <span>{ord.status}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Mark Completed button if APPROVED */}
                            {ord.status === "APPROVED" && (
                              <button
                                type="button"
                                onClick={() => handleMarkCompleted(ord.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-[#006d36] font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                title="Mark Order as Completed"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Complete</span>
                              </button>
                            )}

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditOrder(ord)}
                              className="p-1.5 rounded-lg border border-[#e2e2e2] text-[#006d36] hover:bg-emerald-50 cursor-pointer"
                              title="Edit Order Details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteOrder(ord.id)}
                              className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                              title="Delete Order"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Receipt Button */}
                            <button
                              type="button"
                              onClick={() => setSelectedReceiptOrder(ord)}
                              className="p-1.5 rounded-lg border border-[#e2e2e2] text-[#5f5e5e] hover:bg-gray-100 cursor-pointer"
                              title="View Invoice Receipt"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================
          MODAL: EDIT ORDER
         ======================================================== */}
      {editingOrderModalOpen && editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-emerald-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e2e2]">
              <div>
                <h3 className="font-black text-base text-[#1a1c1c]">Edit Order Details</h3>
                <span className="text-[11px] font-mono text-[#006d36] font-bold">
                  Order #{editingOrder.id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditingOrderModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditOrder} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1">
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  value={orderEditForm.customerName}
                  onChange={(e) =>
                    setOrderEditForm({ ...orderEditForm, customerName: e.target.value })
                  }
                  required
                  className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-2.5 font-bold text-xs text-[#1a1c1c] outline-none focus:border-[#006d36]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1">
                  Customer Mobile *
                </label>
                <input
                  type="text"
                  value={orderEditForm.customerMobile}
                  onChange={(e) =>
                    setOrderEditForm({ ...orderEditForm, customerMobile: e.target.value })
                  }
                  className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-2.5 font-mono text-xs text-[#1a1c1c] outline-none focus:border-[#006d36]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    value={orderEditForm.amount}
                    onChange={(e) =>
                      setOrderEditForm({ ...orderEditForm, amount: Number(e.target.value) })
                    }
                    required
                    className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-2.5 font-mono font-bold text-xs text-[#1a1c1c] outline-none focus:border-[#006d36]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1">
                    PV (Points) *
                  </label>
                  <input
                    type="number"
                    value={orderEditForm.pv}
                    onChange={(e) =>
                      setOrderEditForm({ ...orderEditForm, pv: Number(e.target.value) })
                    }
                    required
                    className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-2.5 font-mono font-bold text-xs text-[#1a1c1c] outline-none focus:border-[#006d36]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1a1c1c] uppercase tracking-wider mb-1">
                  Order Status *
                </label>
                <select
                  value={orderEditForm.status}
                  onChange={(e) =>
                    setOrderEditForm({ ...orderEditForm, status: e.target.value })
                  }
                  className="w-full bg-[#f9f9f9] border border-[#e2e2e2] rounded-xl p-2.5 font-bold text-xs text-[#1a1c1c] outline-none focus:border-[#006d36]"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingOrderModalOpen(false)}
                  className="w-full py-2.5 rounded-xl border border-[#e2e2e2] text-[#5f5e5e] font-bold text-xs hover:bg-gray-50 cursor-pointer"
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

      {/* ========================================================
          MODAL: INVOICE RECEIPT
         ======================================================== */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-emerald-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e2e2]">
              <div>
                <h3 className="font-black text-base text-[#1a1c1c]">Official Invoice Receipt</h3>
                <span className="text-[11px] font-mono text-[#006d36] font-bold">
                  Order #{selectedReceiptOrder.id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceiptOrder(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-[#f9f9f9] rounded-2xl border border-[#e2e2e2] space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#5f5e5e]">Associate ID:</span>
                <span className="font-bold text-[#1a1c1c]">{selectedReceiptOrder.memberId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5f5e5e]">Billed By:</span>
                <span className="font-bold text-[#006d36]">{selectedReceiptOrder.billedBy || selectedReceiptOrder.memberId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5f5e5e]">Customer:</span>
                <span className="font-bold text-[#1a1c1c]">{selectedReceiptOrder.fullName}</span>
              </div>
              {selectedReceiptOrder.mobile && (
                <div className="flex justify-between">
                  <span className="text-[#5f5e5e]">Mobile:</span>
                  <span className="font-bold text-[#1a1c1c]">{selectedReceiptOrder.mobile}</span>
                </div>
              )}
              {selectedReceiptOrder.shippingAddress && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#5f5e5e]">Address:</span>
                  <span className="font-medium text-[#1a1c1c] text-right max-w-[200px] truncate">{selectedReceiptOrder.shippingAddress}</span>
                </div>
              )}
            </div>

            {/* Items Breakdown */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-[#5f5e5e] tracking-wider block">
                Products Summary
              </span>
              <div className="max-h-40 overflow-y-auto divide-y divide-[#e2e2e2] border border-[#e2e2e2] rounded-xl text-xs">
                {selectedReceiptOrder.items && selectedReceiptOrder.items.length > 0 ? (
                  selectedReceiptOrder.items.map((it, idx) => (
                    <div key={idx} className="p-2 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-[#1a1c1c] block">{it.name}</span>
                        <span className="text-[10px] text-[#5f5e5e] font-mono">
                          ₹{it.mrp} × {it.quantity}
                        </span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-bold text-[#1a1c1c] block">
                          ₹{it.subtotalMrp || it.mrp * it.quantity}
                        </span>
                        <span className="text-[10px] text-[#006d36] font-bold">
                          +{it.subtotalPv || it.pv * it.quantity} PV
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-[#5f5e5e]">{selectedReceiptOrder.packageName}</div>
                )}
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5f5e5e] block">Total Paid (₹)</span>
                <span className="font-mono text-xl font-black text-[#006d36]">
                  ₹{selectedReceiptOrder.amount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-[#5f5e5e] block">Total PV Credited</span>
                <span className="font-mono text-xl font-black text-[#006d36]">
                  +{selectedReceiptOrder.pv} PV
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedReceiptOrder(null)}
              className="w-full py-2.5 rounded-xl bg-[#006d36] hover:bg-[#005025] text-white font-bold text-xs cursor-pointer"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
