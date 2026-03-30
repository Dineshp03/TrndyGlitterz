"use client";

import { useState, useMemo } from "react";
import { ShoppingBag, Clock, CheckCircle2, AlertCircle, Package, Search, Filter, X } from "lucide-react";

import { useOrderStore, GlobalOrder } from "@/store/useOrderStore";

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
  delivered: { label: "Delivered", icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
  processing: { label: "Processing", icon: Clock, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
  pending: { label: "Pending", icon: Package, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
  cancelled: { label: "Cancelled", icon: AlertCircle, color: "text-red-500", bg: "bg-red-50 border-red-100" },
};

type Order = GlobalOrder;

export default function OrdersPage() {
  const { orders, updateOrderStatus } = useOrderStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editStatus, setEditStatus] = useState<string>("");

  // Filtering & Searching Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = 
        order.customer.toLowerCase().includes(search.toLowerCase()) || 
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.product.toLowerCase().includes(search.toLowerCase());
      
      const matchesFilter = filter === "All" || 
        (filter === "Pending" && (order.status === "pending" || order.status === "processing")) ||
        order.status.toLowerCase() === filter.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [orders, search, filter]);

  // Tab stats calculated from all current orders
  const stats = [
    { label: "All", count: orders.length },
    { label: "Delivered", count: orders.filter(o => o.status === "delivered").length },
    { label: "Pending", count: orders.filter(o => o.status === "pending" || o.status === "processing").length },
    { label: "Cancelled", count: orders.filter(o => o.status === "cancelled").length },
  ];

  const handleRowClick = (order: Order) => {
    setSelectedOrder(order);
    setEditStatus(order.status);
  };

  const handleUpdateStatus = () => {
    if (selectedOrder) {
      updateOrderStatus(selectedOrder.id, editStatus)
      setSelectedOrder(null);
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
      <div className="grid grid-cols-4 gap-3 mb-6">
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
      <div className="hidden md:block bg-white rounded-2xl border border-[#F0EDE8] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#F0EDE8]">
              {["Order ID", "Customer", "Product", "Qty", "Amount", "Status", "Date"].map((h) => (
                <th key={h} className="text-left text-[9px] font-mono text-[#bbb] uppercase tracking-[0.15em] px-5 py-3.5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? filteredOrders.map((order) => {
              const s = statusConfig[order.status];
              const StatusIcon = s?.icon || Package;
              return (
                <tr key={order.id} onClick={() => handleRowClick(order)} className="border-b border-[#F0EDE8]/60 hover:bg-[#FAFAF8] transition-colors cursor-pointer">
                  <td className="px-5 py-3.5 text-xs font-mono text-[#E8809A]">{order.id}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#F5B8C8]/60 to-[#E8809A]/60 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                        {order.customer[0]}
                      </div>
                      <span className="text-xs text-[#2C2C2C] font-medium">{order.customer}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[#888]">{order.product}</td>
                  <td className="px-5 py-3.5 text-xs text-[#555]">{order.qty}</td>
                  <td className="px-5 py-3.5 text-xs font-bold text-[#2C2C2C]">{order.amount}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border ${s.bg} ${s.color}`}>
                      <StatusIcon size={10} />
                      {s.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[10px] text-[#bbb]">{order.date}</td>
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
      <div className="md:hidden space-y-3">
        {filteredOrders.length > 0 ? filteredOrders.map((order) => {
          const s = statusConfig[order.status];
          const StatusIcon = s?.icon || Package;
          return (
            <div key={order.id} onClick={() => handleRowClick(order)} className="bg-white rounded-2xl border border-[#F0EDE8] p-4 cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F5B8C8]/60 to-[#E8809A]/60 flex items-center justify-center text-white text-[10px] font-bold">
                    {order.customer[0]}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#2C2C2C]">{order.customer}</p>
                    <p className="text-[10px] font-mono text-[#E8809A]">{order.id}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 text-[9px] font-medium px-2 py-1 rounded-full border ${s.bg} ${s.color}`}>
                  <StatusIcon size={9} />
                  {s.label}
                </span>
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
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EDE8]">
              <h2 className="text-lg font-serif text-[#2C2C2C]">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 text-[#888]">
                <X size={16} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] font-mono text-[#bbb] uppercase tracking-widest">Order ID</p>
                  <p className="text-sm font-bold text-[#E8809A]">{selectedOrder.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-mono text-[#bbb] uppercase tracking-widest">Date</p>
                  <p className="text-sm font-medium text-[#2C2C2C]">{selectedOrder.date}</p>
                </div>
              </div>

              <div className="bg-[#FAFAF8] rounded-xl p-4 mb-6 border border-[#F0EDE8]">
                <p className="text-xs font-semibold text-[#2C2C2C] mb-1">{selectedOrder.customer}</p>
                <p className="text-xs text-[#555] mb-2">{selectedOrder.product} <span className="text-[#aaa] ml-1">x{selectedOrder.qty}</span></p>
                <p className="text-sm font-bold text-[#2C2C2C]">{selectedOrder.amount}</p>
              </div>

              <div>
                <label className="text-[10px] font-mono text-[#bbb] uppercase tracking-widest mb-2 block">Update Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(statusConfig).map(([key, config]) => (
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
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#F0EDE8] flex justify-end gap-3 bg-[#FAFAF8]">
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
                Save Changes
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
