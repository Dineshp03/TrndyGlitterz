"use client";

import Link from "next/link";
import { products } from "@/data/products";
import {
  TrendingUp,
  ShoppingBag,
  Gem,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const kpiCards = [
  {
    label: "Total Revenue",
    value: "₹2,84,500",
    change: "+18.4%",
    positive: true,
    icon: TrendingUp,
    color: "from-[#F5B8C8] to-[#E8809A]",
    lightColor: "bg-[#F5B8C8]/15",
  },
  {
    label: "Total Orders",
    value: "1,248",
    change: "+12.1%",
    positive: true,
    icon: ShoppingBag,
    color: "from-[#b8d4f5] to-[#809ae8]",
    lightColor: "bg-[#b8d4f5]/20",
  },
  {
    label: "Active Products",
    value: String(products.length),
    change: "+2",
    positive: true,
    icon: Gem,
    color: "from-[#f5e4b8] to-[#e8c880]",
    lightColor: "bg-[#f5e4b8]/25",
  },
  {
    label: "Customers",
    value: "842",
    change: "-3.2%",
    positive: false,
    icon: Users,
    color: "from-[#b8f5d4] to-[#80e8a9]",
    lightColor: "bg-[#b8f5d4]/20",
  },
];

const recentOrders = [
  { id: "#ORD-1042", customer: "Priya Sharma", product: "Pearl Drop Earrings", amount: "₹2,250", status: "delivered", date: "11 Mar 2026" },
  { id: "#ORD-1041", customer: "Ananya Reddy", product: "Crystal Hairband", amount: "₹1,890", status: "processing", date: "11 Mar 2026" },
  { id: "#ORD-1040", customer: "Meera Nair", product: "Gold Hoop Earrings", amount: "₹3,100", status: "pending", date: "10 Mar 2026" },
  { id: "#ORD-1039", customer: "Divya Kapoor", product: "Velvet Scrunchie Set", amount: "₹780", status: "delivered", date: "10 Mar 2026" },
  { id: "#ORD-1038", customer: "Riya Patel", product: "Diamond Stud Earrings", amount: "₹4,200", status: "cancelled", date: "09 Mar 2026" },
];

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
  delivered: { label: "Delivered", icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
  processing: { label: "Processing", icon: Clock, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
  pending: { label: "Pending", icon: Package, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
  cancelled: { label: "Cancelled", icon: AlertCircle, color: "text-red-500", bg: "bg-red-50 border-red-100" },
};

const topProducts = products.slice(0, 5).map((p, i) => ({
  ...p,
  sold: Math.floor(Math.random() * 200 + 50) - i * 15,
  revenue: `₹${(p.price * (Math.floor(Math.random() * 200 + 50) - i * 15)).toLocaleString("en-IN")}`,
}));

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  return (
    <div className="min-h-screen p-4 md:p-8 max-w-[1400px]">

      {/* Mobile Page Header */}
      <div className="md:hidden flex items-center justify-between mb-6 pt-4">
        <div>
          <p className="text-[10px] font-mono text-[#bbb] uppercase tracking-[0.2em]">Welcome back</p>
          <h1 className="text-2xl font-serif text-[#2C2C2C] mt-0.5">Dashboard</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F5B8C8] to-[#E8809A] flex items-center justify-center text-white font-bold text-sm shadow-md">
          A
        </div>
      </div>

      {/* Desktop Page Header */}
      <div className="hidden md:flex items-end justify-between mb-8">
        <div>
          <p className="text-[10px] font-mono text-[#bbb] uppercase tracking-[0.2em] mb-1">Overview</p>
          <h1 className="text-3xl font-serif text-[#2C2C2C] tracking-tight">Good afternoon ✨</h1>
          <p className="text-sm text-[#aaa] mt-1">Here&apos;s what&apos;s happening with your store today.</p>
        </div>
        <Link
          href="/admin/products"
          className="flex items-center gap-2 bg-[#2C2C2C] text-white text-xs font-medium px-5 py-2.5 rounded-full hover:bg-[#E8809A] transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <Gem size={13} />
          Add Product
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-2xl p-4 md:p-5 border border-[#F0EDE8] hover:shadow-md transition-shadow duration-300 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.lightColor}`}>
                  <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center shadow-sm`}>
                    <Icon size={12} className="text-white" />
                  </div>
                </div>
                <span
                  className={`flex items-center gap-0.5 text-[10px] font-medium ${
                    card.positive ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {card.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {card.change}
                </span>
              </div>
              <p className="text-xl md:text-2xl font-bold text-[#2C2C2C] tracking-tight">{card.value}</p>
              <p className="text-[10px] text-[#aaa] uppercase tracking-widest mt-0.5">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

        {/* Recent Orders — 2 cols wide */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#F0EDE8] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0EDE8]">
            <div>
              <h2 className="text-sm font-semibold text-[#2C2C2C]">Recent Orders</h2>
              <p className="text-[10px] text-[#bbb] mt-0.5">Last 5 transactions</p>
            </div>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-[10px] font-mono text-[#E8809A] uppercase tracking-[0.1em] hover:gap-2 transition-all"
            >
              View All <ChevronRight size={11} />
            </Link>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F0EDE8]">
                  {["Order ID", "Customer", "Product", "Amount", "Status", "Date"].map((h) => (
                    <th key={h} className="text-left text-[9px] font-mono text-[#bbb] uppercase tracking-[0.15em] px-5 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const s = statusConfig[order.status];
                  const StatusIcon = s.icon;
                  return (
                    <tr key={order.id} className="border-b border-[#F0EDE8]/60 hover:bg-[#FAFAF8] transition-colors group">
                      <td className="px-5 py-3.5 text-xs font-mono text-[#E8809A]">{order.id}</td>
                      <td className="px-5 py-3.5 text-xs text-[#2C2C2C] font-medium">{order.customer}</td>
                      <td className="px-5 py-3.5 text-xs text-[#888] truncate max-w-[120px]">{order.product}</td>
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
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-[#F0EDE8]">
            {recentOrders.map((order) => {
              const s = statusConfig[order.status];
              const StatusIcon = s.icon;
              return (
                <div key={order.id} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#E8809A]">{order.id}</span>
                      <span className={`inline-flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full border ${s.bg} ${s.color}`}>
                        <StatusIcon size={9} />
                        {s.label}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[#2C2C2C] mt-0.5">{order.customer}</p>
                    <p className="text-[10px] text-[#aaa]">{order.product}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#2C2C2C]">{order.amount}</p>
                    <p className="text-[9px] text-[#ccc] mt-0.5">{order.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products — 1 col */}
        <div className="bg-white rounded-2xl border border-[#F0EDE8] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0EDE8]">
            <div>
              <h2 className="text-sm font-semibold text-[#2C2C2C]">Top Products</h2>
              <p className="text-[10px] text-[#bbb] mt-0.5">Best performers</p>
            </div>
            <Link
              href="/admin/products"
              className="flex items-center gap-1 text-[10px] font-mono text-[#E8809A] uppercase tracking-[0.1em] hover:gap-2 transition-all"
            >
              All <ChevronRight size={11} />
            </Link>
          </div>

          <div className="divide-y divide-[#F0EDE8]/60">
            {topProducts.map((product, i) => (
              <div key={product.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#FAFAF8] transition-colors">
                <span className="text-[10px] font-mono text-[#ccc] w-4 flex-shrink-0">{i + 1}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-9 h-9 rounded-xl object-cover flex-shrink-0 border border-[#F0EDE8]"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#2C2C2C] truncate">{product.name}</p>
                  <p className="text-[10px] text-[#aaa]">{product.category}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-[#2C2C2C]">{product.revenue}</p>
                  <p className="text-[10px] text-[#aaa]">{product.sold} sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Quick Actions (mobile only) */}
      <div className="md:hidden mt-6 grid grid-cols-2 gap-3">
        {[
          { label: "Add Product", icon: Gem, href: "/admin/products", color: "bg-[#F5B8C8]/20 border-[#F5B8C8]/40" },
          { label: "View Orders", icon: ShoppingBag, href: "/admin/orders", color: "bg-[#b8d4f5]/15 border-[#b8d4f5]/40" },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className={`flex items-center gap-3 px-4 py-4 rounded-2xl border ${action.color} transition-all active:scale-95`}
            >
              <Icon size={18} className="text-[#888]" />
              <span className="text-xs font-medium text-[#555]">{action.label}</span>
            </Link>
          );
        })}
      </div>

    </div>
  );
}
