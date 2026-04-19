"use client";

import { useEffect, useMemo, useState } from "react";
import { useOrderStore, GlobalOrder } from "@/store/useOrderStore";
import {
  Search, Phone, MapPin, X, Package, CheckCircle2,
  CreditCard, ChevronDown, ChevronUp, ShoppingBag
} from "lucide-react";

const avatarColors = [
  "from-[#F5B8C8] to-[#E8809A]",
  "from-[#b8d4f5] to-[#809ae8]",
  "from-[#f5e4b8] to-[#e8c880]",
  "from-[#b8f5d4] to-[#80e8a9]",
  "from-[#f5c4b8] to-[#e8a080]",
  "from-[#d4b8f5] to-[#a080e8]",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type CustomerRow = {
  name: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  orders: GlobalOrder[];
};

export default function CustomersPage() {
  const { orders, fetchOrders, isLoading } = useOrderStore();
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRow | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Only Razorpay-paid orders
  const razorpayOrders = useMemo(
    () => orders.filter((o) => o.payment_method === "razorpay"),
    [orders]
  );

  // Group by phone number → deduplicate customers
  const customers = useMemo<CustomerRow[]>(() => {
    const map = new Map<string, CustomerRow>();
    for (const order of razorpayOrders) {
      const key = order.customer_phone ?? order.customer_email;
      if (!key) continue;
      if (!map.has(key)) {
        map.set(key, {
          name: order.customer_name,
          phone: order.customer_phone ?? "—",
          address: order.address,
          totalOrders: 0,
          totalSpent: 0,
          orders: [],
        });
      }
      const entry = map.get(key)!;
      entry.totalOrders += 1;
      entry.totalSpent += order.total;
      entry.orders.push(order);
    }
    return Array.from(map.values());
  }, [razorpayOrders]);

  const filtered = useMemo(
    () =>
      customers.filter((c) => {
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.address.toLowerCase().includes(q)
        );
      }),
    [customers, search]
  );

  const whatsappLink = (phone: string, name: string) => {
    const num = phone.replace(/\D/g, "");
    return `https://wa.me/91${num}?text=Hi%20${encodeURIComponent(name)}%2C%20thank%20you%20for%20shopping%20at%20Trendy%20Glitterz!`;
  };

  return (
    <div className="p-4 md:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 pt-4 md:pt-0">
        <div>
          <p className="text-[10px] font-mono text-[#bbb] uppercase tracking-[0.2em]">Admin</p>
          <h1 className="text-2xl md:text-3xl font-serif text-[#2C2C2C] mt-0.5 tracking-tight">
            Customers
          </h1>
          <p className="text-[11px] text-[#aaa] font-sans mt-1 flex items-center gap-1.5">
            <CreditCard size={11} className="text-green-500" />
            Showing only verified Razorpay-paid customers
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ccc]" />
          <input
            type="text"
            placeholder="Search by name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#F0EDE8] rounded-full pl-8 pr-4 py-2 text-xs text-[#555] placeholder-[#ccc] focus:outline-none focus:border-[#F5B8C8] transition-all"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Verified Customers", value: isLoading ? "..." : customers.length.toString() },
          {
            label: "Total Revenue",
            value: isLoading
              ? "..."
              : `₹${customers.reduce((acc, c) => acc + c.totalSpent, 0).toLocaleString("en-IN")}`,
          },
          { label: "Total Orders", value: isLoading ? "..." : razorpayOrders.length.toString() },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-[#F0EDE8] p-3 md:p-4 text-center">
            <p className="text-xl md:text-2xl font-bold text-[#2C2C2C]">{stat.value}</p>
            <p className="text-[9px] text-[#bbb] uppercase tracking-widest mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24 bg-white rounded-2xl border border-[#F0EDE8]">
          <div className="w-6 h-6 rounded-full border-2 border-[#F5B8C8]/30 border-t-[#F5B8C8] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-[#F0EDE8] gap-4">
          <ShoppingBag size={36} className="text-[#ddd]" strokeWidth={1} />
          <div className="text-center">
            <p className="text-sm font-medium text-[#888]">No Razorpay customers yet</p>
            <p className="text-[11px] text-[#bbb] mt-1">
              Customers will appear here after completing a Razorpay payment.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-[#F0EDE8] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F0EDE8]">
                  {["Customer", "WhatsApp", "Address", "Orders", "Total Spent"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[9px] font-mono text-[#bbb] uppercase tracking-[0.15em] px-5 py-3.5"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer, i) => (
                  <tr
                    key={customer.phone + i}
                    onClick={() => setSelectedCustomer(customer)}
                    className="border-b border-[#F0EDE8]/60 hover:bg-[#FAFAF8] transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                        >
                          {getInitials(customer.name)}
                        </div>
                        <p className="text-xs font-medium text-[#2C2C2C]">{customer.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <a
                        href={whatsappLink(customer.phone, customer.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 text-[11px] text-[#25D366] hover:underline font-medium"
                      >
                        <Phone size={10} />
                        {customer.phone}
                      </a>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1 text-[11px] text-[#888]">
                        <MapPin size={10} className="text-[#ccc] flex-shrink-0" />
                        <span className="truncate max-w-[200px]">{customer.address}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium text-[#555]">
                      {customer.totalOrders}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-bold text-[#2C2C2C]">
                      ₹{customer.totalSpent.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((customer, i) => (
              <div
                key={customer.phone + i}
                onClick={() => setSelectedCustomer(customer)}
                className="bg-white rounded-2xl border border-[#F0EDE8] p-4 cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {getInitials(customer.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#2C2C2C]">{customer.name}</p>
                    <a
                      href={whatsappLink(customer.phone, customer.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[11px] text-[#25D366] font-medium"
                    >
                      {customer.phone}
                    </a>
                  </div>
                </div>
                <p className="text-[11px] text-[#888] mb-3 flex items-start gap-1">
                  <MapPin size={10} className="text-[#ccc] mt-0.5 flex-shrink-0" />
                  {customer.address}
                </p>
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#F0EDE8]">
                  <div className="text-center">
                    <p className="text-sm font-bold text-[#2C2C2C]">{customer.totalOrders}</p>
                    <p className="text-[9px] text-[#bbb] uppercase tracking-widest">Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-[#2C2C2C]">
                      ₹{customer.totalSpent.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[9px] text-[#bbb] uppercase tracking-widest">Spent</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-obsidian/40 backdrop-blur-sm"
          onClick={() => { setSelectedCustomer(null); setExpandedOrder(null); }}
        >
          <div
            className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex flex-col items-center justify-center pt-8 pb-6 px-6 relative border-b border-[#F0EDE8] flex-shrink-0">
              <button
                onClick={() => { setSelectedCustomer(null); setExpandedOrder(null); }}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 text-[#888]"
              >
                <X size={16} />
              </button>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#F5B8C8] to-[#E8809A] flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-sm">
                {getInitials(selectedCustomer.name)}
              </div>
              <h2 className="text-xl font-serif text-[#2C2C2C] mb-1">{selectedCustomer.name}</h2>
              <span className="flex items-center gap-1 text-[10px] text-green-600 bg-green-50 px-3 py-1 rounded-full font-mono uppercase tracking-widest">
                <CheckCircle2 size={10} className="fill-green-100" />
                Razorpay Verified
              </span>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              {/* Contact Details */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-[#FAFAF8] rounded-xl p-4 border border-[#F0EDE8] space-y-3">
                  <p className="text-[10px] font-mono text-[#bbb] uppercase tracking-widest">Contact Details</p>
                  <div className="flex items-center gap-3">
                    <Phone size={14} className="text-[#25D366]" />
                    <a
                      href={whatsappLink(selectedCustomer.phone, selectedCustomer.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-[#25D366] hover:underline"
                    >
                      {selectedCustomer.phone} (WhatsApp)
                    </a>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={14} className="text-[#aaa] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-[#2C2C2C]">{selectedCustomer.address}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-[#FAFAF8] rounded-xl p-4 border border-[#F0EDE8] grid grid-cols-2 gap-4">
                  <div className="text-center border-r border-[#F0EDE8]">
                    <p className="text-2xl font-bold text-[#2C2C2C]">{selectedCustomer.totalOrders}</p>
                    <p className="text-[9px] font-mono text-[#888] uppercase tracking-widest mt-1">Paid Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-[#2C2C2C]">₹{selectedCustomer.totalSpent.toLocaleString("en-IN")}</p>
                    <p className="text-[9px] font-mono text-[#888] uppercase tracking-widest mt-1">Total Spent</p>
                  </div>
                </div>
              </div>

              {/* Orders Breakdown */}
              <div>
                <p className="text-[10px] font-mono text-[#bbb] uppercase tracking-widest mb-3">
                  Order History
                </p>
                <div className="space-y-3">
                  {selectedCustomer.orders.map((order) => {
                    const isOpen = expandedOrder === order.id;
                    const totalQty = order.items?.reduce((acc, i) => acc + i.quantity, 0) ?? 0;
                    return (
                      <div key={order.id} className="border border-[#F0EDE8] rounded-xl overflow-hidden">
                        <button
                          onClick={() => setExpandedOrder(isOpen ? null : order.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-[#FAFAF8] transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <Package size={16} className="text-[#D4AF37]" strokeWidth={1.5} />
                            <div>
                              <p className="text-xs font-medium text-[#2C2C2C]">
                                {order.product ?? "Order"}
                              </p>
                              <p className="text-[10px] text-[#aaa]">
                                {new Date(order.created_at).toLocaleDateString("en-IN", {
                                  day: "numeric", month: "short", year: "numeric"
                                })}
                                {" · "}Qty: {totalQty}
                                {" · "}₹{order.total.toLocaleString("en-IN")}
                              </p>
                            </div>
                          </div>
                          {isOpen ? <ChevronUp size={14} className="text-[#ccc]" /> : <ChevronDown size={14} className="text-[#ccc]" />}
                        </button>

                        {isOpen && order.items && (
                          <div className="border-t border-[#F0EDE8] px-4 py-3 bg-[#FAFAF8] space-y-2">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center justify-between text-xs text-[#555]">
                                <div>
                                  <p className="font-medium text-[#2C2C2C]">{item.product_name}</p>
                                  <p className="text-[#aaa]">Qty: {item.quantity} × ₹{item.price}</p>
                                </div>
                                <p className="font-bold text-[#2C2C2C]">
                                  ₹{(item.quantity * item.price).toLocaleString("en-IN")}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#F0EDE8] flex gap-3 bg-[#FAFAF8] flex-shrink-0">
              <a
                href={whatsappLink(selectedCustomer.phone, selectedCustomer.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#25D366] text-white text-xs font-bold uppercase tracking-[0.1em] rounded-full hover:bg-[#128C7E] transition-colors shadow-sm"
              >
                <Phone size={14} />
                WhatsApp
              </a>
              <button
                onClick={() => { setSelectedCustomer(null); setExpandedOrder(null); }}
                className="px-5 py-2.5 border border-[#E0DDD8] text-[#888] text-xs font-bold uppercase tracking-[0.1em] rounded-full hover:bg-[#F0EDE8] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
