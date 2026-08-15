"use client";

import { useState, useMemo } from "react";
import { ShoppingBag, Clock, CheckCircle2, AlertCircle, Package, Search, Filter, X } from "lucide-react";

import { useAuth } from "@clerk/nextjs";
import { useOrderStore, GlobalOrder } from "@/store/useOrderStore";
import { useEffect } from "react";

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
  pending: { label: "Order Confirmed", icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
  processing: { label: "Order Confirmed", icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
  shipped: { label: "Shipped", icon: Package, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
  delivered: { label: "Delivered", icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
  cancelled: { label: "Cancelled", icon: AlertCircle, color: "text-red-500", bg: "bg-red-50 border-red-100" },
};

const allowedUpdateStatuses = ["pending", "shipped", "delivered", "cancelled"];

type Order = GlobalOrder;

export default function OrdersPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { orders, fetchOrders, updateOrderStatus, deleteOrder } = useOrderStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editStatus, setEditStatus] = useState<string>("");

  useEffect(() => {
    async function loadOrders() {
      if (isLoaded && isSignedIn) {
        const token = await getToken();
        if (token) {
          fetchOrders(token);
        }
      }
    }
    loadOrders();
  }, [isLoaded, isSignedIn, getToken, fetchOrders]);

  // Filtering & Searching Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = 
        (order.customer?.toLowerCase() ?? "").includes(search.toLowerCase()) || 
        (order.id?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
        (order.product?.toLowerCase() ?? "").includes(search.toLowerCase());
      
      const matchesFilter = filter === "All" || 
        (filter === "Order Confirmed" && (order.status === "pending" || order.status === "processing")) ||
        (filter === "Shipped" && order.status === "shipped") ||
        (filter === "Delivered" && order.status === "delivered") ||
        (filter === "Cancelled" && order.status === "cancelled");

      return matchesSearch && matchesFilter;
    });
  }, [orders, search, filter]);

  // Tab stats calculated from all current orders
  const stats = useMemo(() => [
    { label: "All", count: orders.length },
    { label: "Order Confirmed", count: orders.filter(o => o.status === "pending" || o.status === "processing").length },
    { label: "Shipped", count: orders.filter(o => o.status === "shipped").length },
    { label: "Delivered", count: orders.filter(o => o.status === "delivered").length },
    { label: "Cancelled", count: orders.filter(o => o.status === "cancelled").length },
  ], [orders]);

  const handleRowClick = (order: Order) => {
    setSelectedOrder(order);
    setEditStatus(order.status);
  };

  const handleUpdateStatus = async () => {
    if (selectedOrder && isLoaded && isSignedIn) {
      const token = await getToken();
      if (token) {
        await updateOrderStatus(selectedOrder.id, editStatus as Order["status"], token);
        setSelectedOrder(null);
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 pt-4 md:pt-0">
        <div>
          <p className="text-[10px] font-mono text-[#bbb] uppercase tracking-[0.2em]">Admin</p>
          <h1 className="text-2xl md:text-3xl font-serif text-[#2C2C2C] mt-0.5 tracking-tight">Orders</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none sm:w-56">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ccc]" />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-[#F0EDE8] rounded-full pl-8 pr-4 py-2 text-xs text-[#555] placeholder-[#ccc] focus:outline-none focus:border-[#F5B8C8] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {stats.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setFilter(tab.label)}
            className={`py-2.5 rounded-xl text-xs font-medium border transition-all ${
              filter === tab.label
                ? "bg-[#2C2C2C] text-white border-[#2C2C2C]"
                : "bg-white text-[#888] border-[#F0EDE8] hover:border-[#ccc]"
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 text-[10px] ${filter === tab.label ? "text-white/70" : "text-[#ccc]"}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Orders Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-2xl border border-[#F0EDE8] overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-[#F0EDE8]">
              {["Order ID", "Customer Details", "Contact", "Product", "Amount", "Status", "Date"].map((h) => (
                <th key={h} className="text-left text-[9px] font-mono text-[#bbb] uppercase tracking-[0.15em] px-4 py-3.5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? filteredOrders.map((order) => {
              const s = statusConfig[order.status] || {
                label: order.status || "Pending",
                icon: Package,
                color: "text-amber-600",
                bg: "bg-amber-50 border-amber-100"
              };
              const StatusIcon = s.icon;
              const shortId = order.id?.split("-")[0]?.toUpperCase() || order.id;
              return (
                <tr key={order.id} onClick={() => handleRowClick(order)} className="border-b border-[#F0EDE8]/60 hover:bg-[#FAFAF8] transition-colors cursor-pointer">
                  <td className="px-4 py-3.5 text-[10px] font-mono text-[#E8809A] whitespace-nowrap">#{shortId}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F5B8C8]/60 to-[#E8809A]/60 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                        {(order.customer_name || order.customer || "?")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-[#2C2C2C] font-semibold truncate">{order.customer_name || order.customer}</p>
                        {order.address && (
                          <p className="text-[10px] text-[#aaa] truncate max-w-[200px]" title={`${order.address}${order.city ? `, ${order.city}` : ""}${order.pincode ? ` - ${order.pincode}` : ""}`}>{order.address}{order.city ? `, ${order.city}` : ""}{order.pincode ? ` - ${order.pincode}` : ""}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="space-y-0.5">
                      {order.customer_email && <p className="text-[10px] text-[#888] truncate max-w-[180px]">{order.customer_email}</p>}
                      {order.customer_phone && (
                        <a href={`https://wa.me/91${order.customer_phone.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-[10px] text-[#25D366] font-medium hover:underline block">
                          📞 {order.customer_phone}
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-xs text-[#555] truncate max-w-[150px]">{order.product}</p>
                    <p className="text-[10px] text-[#ccc]">x{order.qty}</p>
                  </td>
                  <td className="px-4 py-3.5 text-xs font-bold text-[#2C2C2C] whitespace-nowrap">{order.amount}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border ${s.bg} ${s.color}`}>
                      <StatusIcon size={10} />
                      {s.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[10px] text-[#bbb] whitespace-nowrap">{order.date ? new Date(order.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}</td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-xs text-[#888]">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Orders Cards - Mobile */}
      <div className="lg:hidden space-y-3">
        {filteredOrders.length > 0 ? filteredOrders.map((order) => {
          const s = statusConfig[order.status] || {
            label: order.status || "Pending",
            icon: Package,
            color: "text-amber-600",
            bg: "bg-amber-50 border-amber-100"
          };
          const StatusIcon = s.icon;
          return (
            <div key={order.id} onClick={() => handleRowClick(order)} className="bg-white rounded-2xl border border-[#F0EDE8] p-4 cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F5B8C8]/60 to-[#E8809A]/60 flex items-center justify-center text-white text-[10px] font-bold">
                    {(order.customer_name || order.customer || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#2C2C2C]">{order.customer_name || order.customer}</p>
                    <p className="text-[10px] font-mono text-[#E8809A]">#{order.id?.split("-")[0]?.toUpperCase()}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 text-[9px] font-medium px-2 py-1 rounded-full border ${s.bg} ${s.color}`}>
                  <StatusIcon size={9} />
                  {s.label}
                </span>
              </div>
              {/* Contact Info */}
              <div className="space-y-1 mb-3 pl-10">
                {order.customer_email && <p className="text-[10px] text-[#888] truncate">{order.customer_email}</p>}
                {order.customer_phone && (
                  <a href={`https://wa.me/91${order.customer_phone.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-[10px] text-[#25D366] font-medium hover:underline block">
                    📞 {order.customer_phone}
                  </a>
                )}
                {order.address && <p className="text-[10px] text-[#aaa] truncate">📍 {order.address}{order.city ? `, ${order.city}` : ""}{order.pincode ? ` - ${order.pincode}` : ""}</p>}
              </div>
              <div className="flex items-end justify-between mt-3 pt-3 border-t border-[#F0EDE8]">
                <p className="text-[11px] text-[#888]">{order.product} <span className="text-[#ccc] ml-1">x{order.qty}</span></p>
                <p className="text-sm font-bold text-[#2C2C2C]">{order.amount}</p>
              </div>
            </div>
          );
        }) : (
          <div className="text-center py-8 text-xs text-[#888]">No orders found.</div>
        )}
      </div>

      {/* Modal for Order Details */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-obsidian/40 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EDE8] flex-shrink-0">
              <div>
                <p className="text-[9px] font-mono text-[#bbb] uppercase tracking-widest">Order Details</p>
                <h2 className="text-base font-serif text-[#2C2C2C] mt-0.5">#{selectedOrder.id.split("-")[0].toUpperCase()}</h2>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 text-[#888]">
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 p-6 space-y-4">

              {/* Customer Info */}
              <div className="bg-[#FAFAF8] rounded-xl border border-[#F0EDE8] p-4 space-y-3">
                <p className="text-[9px] font-mono text-[#bbb] uppercase tracking-widest mb-3">Customer</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F5B8C8]/60 to-[#E8809A]/60 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {(selectedOrder.customer_name || selectedOrder.customer || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#2C2C2C]">{selectedOrder.customer_name || selectedOrder.customer}</p>
                    {selectedOrder.customer_email && (
                      <p className="text-[11px] text-[#888]">{selectedOrder.customer_email}</p>
                    )}
                  </div>
                </div>
                {selectedOrder.customer_phone && (
                  <div className="flex items-center gap-2 pt-2 border-t border-[#F0EDE8]">
                    <span className="text-[10px] text-[#bbb] font-mono uppercase tracking-wider w-16">Phone</span>
                    <a
                      href={`https://wa.me/91${selectedOrder.customer_phone.replace(/\D/g,"")}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-sm text-[#25D366] font-medium hover:underline"
                    >
                      {selectedOrder.customer_phone}
                    </a>
                  </div>
                )}
              </div>

              {/* Delivery Address */}
              <div className="bg-[#FAFAF8] rounded-xl border border-[#F0EDE8] p-4">
                <p className="text-[9px] font-mono text-[#bbb] uppercase tracking-widest mb-2">Delivery Address</p>
                <p className="text-sm text-[#2C2C2C] leading-relaxed">
                  {selectedOrder.address ? (
                    <>
                      {selectedOrder.address}
                      {selectedOrder.city ? `, ${selectedOrder.city}` : ""}
                      {selectedOrder.state ? `, ${selectedOrder.state}` : ""}
                      {selectedOrder.pincode ? ` - ${selectedOrder.pincode}` : ""}
                    </>
                  ) : (
                    <span className="text-[#ccc] italic">No address provided</span>
                  )}
                </p>
              </div>

              {/* Order Info Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#FAFAF8] rounded-xl border border-[#F0EDE8] p-3 text-center">
                  <p className="text-[9px] font-mono text-[#bbb] uppercase tracking-wider">Amount</p>
                  <p className="text-sm font-bold text-[#2C2C2C] mt-1">₹{selectedOrder.total?.toLocaleString("en-IN") || selectedOrder.amount}</p>
                </div>
                <div className="bg-[#FAFAF8] rounded-xl border border-[#F0EDE8] p-3 text-center">
                  <p className="text-[9px] font-mono text-[#bbb] uppercase tracking-wider">Payment</p>
                  <p className="text-[11px] font-bold text-[#2C2C2C] mt-1 capitalize">
                    {selectedOrder.payment_method === "cod" ? "Cash on Delivery" : selectedOrder.payment_method?.toUpperCase() || "—"}
                  </p>
                </div>
                <div className="bg-[#FAFAF8] rounded-xl border border-[#F0EDE8] p-3 text-center">
                  <p className="text-[9px] font-mono text-[#bbb] uppercase tracking-wider">Date</p>
                  <p className="text-[11px] font-bold text-[#2C2C2C] mt-1">{selectedOrder.date || new Date(selectedOrder.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
              </div>

              {/* Razorpay Details if payment method is razorpay */}
              {selectedOrder.payment_method === "razorpay" && (selectedOrder.razorpay_payment_id || selectedOrder.razorpay_order_id) && (
                <div className="bg-[#FAFAF8] rounded-xl border border-[#F0EDE8] p-4 space-y-2">
                  <p className="text-[9px] font-mono text-[#bbb] uppercase tracking-widest mb-1">Razorpay Transaction Details</p>
                  {selectedOrder.razorpay_order_id && (
                    <div className="flex justify-between text-xs">
                      <span className="text-[#888] font-light">Order ID:</span>
                      <span className="font-mono text-[#2C2C2C] select-all font-medium">{selectedOrder.razorpay_order_id}</span>
                    </div>
                  )}
                  {selectedOrder.razorpay_payment_id && (
                    <div className="flex justify-between text-xs">
                      <span className="text-[#888] font-light">Payment ID:</span>
                      <span className="font-mono text-[#2C2C2C] select-all font-medium">{selectedOrder.razorpay_payment_id}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="border border-[#F0EDE8] rounded-xl overflow-hidden">
                  <p className="text-[9px] font-mono text-[#bbb] uppercase tracking-widest px-4 py-3 border-b border-[#F0EDE8] bg-[#FAFAF8]">
                    Items Ordered · {selectedOrder.items.length} product{selectedOrder.items.length > 1 ? "s" : ""}
                  </p>
                  <div className="divide-y divide-[#F0EDE8]">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                        {item.product_image ? (
                          <img src={item.product_image} alt={item.product_name} className="w-10 h-12 object-cover rounded-lg flex-shrink-0 bg-[#f5f5f5]" />
                        ) : (
                          <div className="w-10 h-12 rounded-lg bg-[#F0EDE8] flex-shrink-0 flex items-center justify-center text-[#ccc] text-[9px]">IMG</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[#2C2C2C] truncate">{item.product_name}</p>
                          <p className="text-[10px] text-[#aaa]">Qty: {item.quantity} × ₹{item.price}</p>
                        </div>
                        <p className="text-xs font-bold text-[#2C2C2C] flex-shrink-0">
                          ₹{(item.quantity * item.price).toLocaleString("en-IN")}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between px-4 py-3 border-t border-[#F0EDE8] bg-[#FAFAF8]">
                    <span className="text-[10px] font-mono text-[#888] uppercase tracking-wider">Total</span>
                    <span className="text-sm font-bold text-[#2C2C2C]">₹{selectedOrder.total?.toLocaleString("en-IN") || selectedOrder.amount}</span>
                  </div>
                </div>
              )}

              {/* Update Status */}
              <div>
                <label className="text-[9px] font-mono text-[#bbb] uppercase tracking-widest mb-2 block">Update Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {allowedUpdateStatuses.map((key) => {
                    const config = statusConfig[key];
                    return (
                      <button
                        key={key}
                        onClick={() => setEditStatus(key)}
                        className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                          editStatus === key ? `border-[#2C2C2C] bg-[#2C2C2C] text-white` : `border-[#F0EDE8] bg-white text-[#888] hover:border-[#ccc]`
                        }`}
                      >
                        <config.icon size={12} />
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#F0EDE8] flex justify-end gap-3 bg-[#FAFAF8] flex-shrink-0">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-[#888] hover:text-[#2C2C2C] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="px-5 py-2 bg-[#E8809A] text-white text-xs font-bold uppercase tracking-[0.1em] rounded-full hover:bg-burgundy transition-colors shadow-sm"
              >
                Save Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state icon at bottom for visual breathing room */}
      <div className="flex items-center justify-center gap-2 mt-8 text-[#ddd]">
        <ShoppingBag size={16} />
        <span className="text-[10px] font-mono uppercase tracking-widest">End of orders</span>
      </div>
    </div>
  );
}
