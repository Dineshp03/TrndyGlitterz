"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useProductStore } from "@/store/useProductStore";
import { useOrderStore } from "@/store/useOrderStore";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  Download,
  Trash2,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  delivered: { label: "Delivered", icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
  processing: { label: "Processing", icon: Clock, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
  pending: { label: "Pending", icon: Package, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
  cancelled: { label: "Cancelled", icon: AlertCircle, color: "text-red-500", bg: "bg-red-50 border-red-100" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { products, fetchProducts, deleteAllProducts } = useProductStore();
  const { orders, fetchOrders, deleteAllOrders, isLoading: ordersLoading } = useOrderStore();
  
  const [isReset, setIsReset] = useState(false);
  const [filterOption, setFilterOption] = useState("ALL"); // "1M", "2M", "ALL"
  const [greeting, setGreeting] = useState("Good morning");
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, [fetchProducts, fetchOrders]);

  // ─── Analytics Calculations ──────────────────────────────────────────────────
  
  const stats = useMemo(() => {
    if (isReset) return { totalRevenue: 0, totalOrders: 0, activeProducts: 0, customers: 0 };
    
    const totalRevenue = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((acc, o) => acc + (Number(o.total) || 0), 0);
      
    const uniqueCustomers = new Set(orders.map(o => o.customer_email)).size;
    
    return {
      totalRevenue,
      totalOrders: orders.length,
      activeProducts: products.length,
      customers: uniqueCustomers
    };
  }, [orders, products, isReset]);

  const kpiCards = [
    {
      label: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
      change: "+0%",
      positive: true,
      icon: TrendingUp,
      color: "from-[#F5B8C8] to-[#E8809A]",
      lightColor: "bg-[#F5B8C8]/15",
    },
    {
      label: "Total Orders",
      value: String(stats.totalOrders),
      change: "+0%",
      positive: true,
      icon: ShoppingBag,
      color: "from-[#b8d4f5] to-[#809ae8]",
      lightColor: "bg-[#b8d4f5]/20",
    },
    {
      label: "Active Products",
      value: String(stats.activeProducts),
      change: "Live",
      positive: true,
      icon: Gem,
      color: "from-[#f5e4b8] to-[#e8c880]",
      lightColor: "bg-[#f5e4b8]/25",
    },
    {
      label: "Customers",
      value: String(stats.customers),
      change: "+0%",
      positive: true,
      icon: Users,
      color: "from-[#b8f5d4] to-[#80e8a9]",
      lightColor: "bg-[#b8f5d4]/20",
    },
  ];

  const handleResetRequest = () => {
    setShowConfirmReset(true);
  };

  const handleConfirmReset = async () => {
    await deleteAllProducts();
    await deleteAllOrders();
    setIsReset(true);
    setShowConfirmReset(false);
    toast.success("All store data has been successfully cleared from Supabase.");
  };

  const handleCancelReset = () => {
    setShowConfirmReset(false);
  };

  const handleDownloadInvoice = () => {
    if (orders.length === 0 && !isReset) {
      toast.error("No orders found to generate report.");
      return;
    }
    
    const doc = new jsPDF();
    
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(44, 44, 44);
    doc.text("TRENDY GLITTERZ", 14, 22);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Official Sales & Revenue Analytics Report", 14, 30);
    doc.text(`Period: ${filterOption === "ALL" ? "All Time" : "Custom Period"}`, 14, 35);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 40);

    // Summary Section
    doc.setDrawColor(230, 230, 230);
    doc.line(14, 45, 196, 45);
    
    doc.setFont("helvetica", "bold");
    doc.text(`Total Revenue: ₹${stats.totalRevenue.toLocaleString('en-IN')}`, 14, 55);
    doc.text(`Total Orders: ${stats.totalOrders}`, 80, 55);
    doc.text(`Total Customers: ${stats.customers}`, 140, 55);

    // Table Data
    const tableData = orders.map(o => [
      o.id.substring(0, 8).toUpperCase(),
      o.customer_name || o.customer || 'Guest',
      `₹${Number(o.total).toLocaleString('en-IN')}`,
      (o.status || 'pending').toUpperCase(),
      new Date(o.created_at || Date.now()).toLocaleDateString()
    ]);

    if (tableData.length === 0) {
       doc.setFont("helvetica", "italic");
       doc.text("No transaction records found for this period.", 14, 75);
    } else {
       autoTable(doc, {
         startY: 65,
         head: [['Order ID', 'Customer', 'Amount', 'Status', 'Date']],
         body: tableData,
         theme: 'striped',
         headStyles: { fillColor: [232, 128, 154], textColor: [255, 255, 255], fontStyle: 'bold' },
         styles: { fontSize: 8, cellPadding: 4 },
         columnStyles: {
           0: { fontStyle: 'bold' },
           2: { halign: 'right' }
         }
       });
    }

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, 196, 285, { align: 'right' });
      doc.text("Trendy Glitterz - Confidential Business Report", 14, 285);
    }

    doc.save(`Trendy_Glitterz_Sales_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success(`Professional PDF Sales Report downloaded!`);
  };

  const currentKPIs = kpiCards;
  const currentOrders = isReset ? [] : orders.slice(0, 5);
  const currentProducts = isReset ? [] : products.slice(0, 5).map(p => ({
    ...p,
    revenue: `₹${(p.price || 0).toLocaleString('en-IN')}`, // Mock revenue as price for now
    sold: Math.floor(Math.random() * 10) // Mock sold count
  }));

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-[1400px]">

      {/* Mobile Page Header */}
      <div className="md:hidden flex items-center justify-between mb-6 pt-4">
        <div>
          <p className="text-[10px] font-mono text-[#bbb] uppercase tracking-[0.2em]">Welcome back</p>
          <h1 className="text-2xl font-serif text-[#2C2C2C] mt-0.5">Dashboard</h1>
        </div>
        <div className="flex gap-2">
           <button onClick={handleResetRequest} className="w-10 h-10 rounded-full border border-red-100 text-red-400 flex items-center justify-center">
             <Trash2 size={16} />
           </button>
           <button onClick={handleDownloadInvoice} className="w-10 h-10 rounded-full bg-[#E8809A] text-white flex items-center justify-center shadow-md">
             <Download size={16} />
           </button>
        </div>
      </div>

      {/* Desktop Page Header */}
      <div className="hidden md:flex items-end justify-between mb-8">
        <div>
          <p className="text-[10px] font-mono text-[#bbb] uppercase tracking-[0.2em] mb-1">Overview</p>
          <h1 className="text-3xl font-serif text-[#2C2C2C] tracking-tight">{greeting} ✨</h1>
          <p className="text-sm text-[#aaa] mt-1">Here&apos;s what&apos;s happening with your store today.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={filterOption}
            onChange={(e) => setFilterOption(e.target.value)}
            className="text-xs font-medium px-4 py-2.5 rounded-full border border-[#e5e5e5] bg-white text-[#555] focus:outline-none focus:border-[#E8809A] transition-colors appearance-none cursor-pointer pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2212%22%20height%3D%2212%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M3%204.5l3%203%203-3%22%20stroke%3D%22%23999%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right_12px_center] bg-no-repeat"
          >
            <option value="1M">Last 1 Month</option>
            <option value="2M">Last 2 Months</option>
            <option value="ALL">All Time</option>
          </select>
          <button
            onClick={handleDownloadInvoice}
            className="flex items-center gap-2 bg-white border border-[#E8809A]/40 text-[#E8809A] text-xs font-medium px-5 py-2.5 rounded-full hover:bg-[#E8809A] hover:text-white hover:border-[#E8809A] transition-all duration-300 shadow-sm"
          >
            <Download size={14} />
            Sales Report
          </button>
          
          <div className="h-6 w-px bg-gray-200 mx-1"></div>

          <button
            onClick={handleResetRequest}
            className="flex items-center gap-2 bg-white border border-red-100 text-red-500 text-xs font-medium px-5 py-2.5 rounded-full hover:bg-red-50 transition-all duration-300 shadow-sm"
          >
            <Trash2 size={14} />
            Reset Data
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {currentKPIs.map((card) => {
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
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#F0EDE8] overflow-hidden flex flex-col">
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

          {currentOrders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-[#aaa]">
              <Package className="w-8 h-8 opacity-20 mb-2" />
              <p className="text-xs font-mono tracking-widest uppercase">No Recent Orders</p>
            </div>
          ) : (
            <>
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
                    {currentOrders.map((order) => {
                      const s = statusConfig[order.status];
                      const StatusIcon = s.icon;
                      return (
                        <tr key={order.id} className="border-b border-[#F0EDE8]/60 hover:bg-[#FAFAF8] transition-colors group">
                          <td className="px-5 py-3.5 text-xs font-mono text-[#E8809A]">{order.id.substring(0, 8).toUpperCase()}</td>
                          <td className="px-5 py-3.5 text-xs text-[#2C2C2C] font-medium">{order.customer_name || order.customer || 'Guest'}</td>
                          <td className="px-5 py-3.5 text-xs text-[#888] truncate max-w-[120px]">
                            {order.items && order.items.length > 0 
                              ? `${order.items[0].product_name}${order.items.length > 1 ? ` +${order.items.length - 1}` : ''}`
                              : 'No Items'
                            }
                          </td>
                          <td className="px-5 py-3.5 text-xs font-bold text-[#2C2C2C]">₹{Number(order.total).toLocaleString('en-IN')}</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border ${s.bg} ${s.color}`}>
                              <StatusIcon size={10} />
                              {s.label}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-[10px] text-[#bbb]">{new Date(order.created_at || Date.now()).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-[#F0EDE8]">
                {currentOrders.map((order) => {
                  const s = statusConfig[order.status];
                  const StatusIcon = s.icon;
                  return (
                    <div key={order.id} className="flex items-center gap-3 px-4 py-3.5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-[#E8809A]">{order.id.substring(0, 8).toUpperCase()}</span>
                          <span className={`inline-flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full border ${s.bg} ${s.color}`}>
                            <StatusIcon size={9} />
                            {s.label}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-[#2C2C2C] mt-0.5">{order.customer_name || order.customer || 'Guest'}</p>
                        <p className="text-[10px] text-[#aaa] truncate">
                           {order.items && order.items.length > 0 ? order.items[0].product_name : 'No Items'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#2C2C2C]">₹{Number(order.total).toLocaleString('en-IN')}</p>
                        <p className="text-[9px] text-[#ccc] mt-0.5">{new Date(order.created_at || Date.now()).toLocaleDateString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Top Products — 1 col */}
        <div className="bg-white rounded-2xl border border-[#F0EDE8] overflow-hidden flex flex-col">
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

          {currentProducts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-[#aaa]">
              <Gem className="w-8 h-8 opacity-20 mb-2" />
              <p className="text-xs font-mono tracking-widest uppercase">No Active Products</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F0EDE8]/60">
              {currentProducts.map((product, i) => (
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
          )}
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

      {/* Custom Confirm Reset Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl transform scale-100 opacity-100 transition-all">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 mx-auto">
              <AlertCircle className="text-red-500 w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif text-center text-[#2C2C2C] mb-2">Reset Analytics?</h3>
            <p className="text-sm font-sans font-light text-center text-[#555] mb-6">
              Are you sure you want to wipe all dashboard analytics? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={handleCancelReset}
                className="flex-1 py-2.5 rounded-full border border-[#e5e5e5] text-[#555] text-xs font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmReset}
                className="flex-1 py-2.5 rounded-full bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors shadow-sm shadow-red-500/30"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
