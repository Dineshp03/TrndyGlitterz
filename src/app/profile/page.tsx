"use client";

import { useState, useEffect } from "react";
export const dynamic = "force-dynamic";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useClerk, useUser, useAuth } from "@clerk/nextjs";
import { useOrderStore, GlobalOrder } from "@/store/useOrderStore";
import {
  User,
  ShoppingBag,
  LogOut,
  Edit3,
  ChevronRight,
  CheckCircle,
  XCircle,
  Package,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  ShieldCheck,
  Clock,
  FileText,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import Link from "next/link";
import { LogoutModal } from "@/components/ui/LogoutModal";

type Tab = "profile" | "orders";

function formatDate(iso: string) {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function statusColor(status: GlobalOrder["status"]) {
  switch (status) {
    case "delivered": return "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20";
    case "shipped":   return "text-blue-400 bg-blue-400/10 border border-blue-400/20";
    case "processing":return "text-amber-400 bg-amber-400/10 border border-amber-400/20";
    case "cancelled": return "text-red-400 bg-red-400/10 border border-red-400/20";
    case "pending":   return "text-white/50 bg-white/5 border border-white/10";
    default:          return "text-white/50 bg-white/5 border border-white/10";
  }
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  const [tab, setTab] = useState<Tab>("profile");
  const [orders, setOrders] = useState<GlobalOrder[]>([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Edit Profile
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Expandable orders state
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  
  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const downloadInvoice = (order: GlobalOrder) => {
    try {
      const doc = new jsPDF();
      
      // Draw border
      doc.setDrawColor(179, 135, 40); // Gold border
      doc.setLineWidth(1);
      doc.rect(10, 10, 190, 277);
      
      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(179, 135, 40); // Gold
      doc.text("TRENDY GLITTERZ", 20, 30);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Premium Jewelry & Accessories", 20, 37);
      doc.text("Email: support@trendyglitterz.com", 20, 42);
      
      // Invoice Info (Right side)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(44, 44, 44);
      doc.text("INVOICE", 140, 30);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(`Invoice No: INV-${order.id.split("-")[0].toUpperCase()}`, 140, 37);
      doc.text(`Date: ${new Date(order.created_at).toLocaleDateString("en-IN")}`, 140, 42);
      doc.text(`Status: ${order.status.toUpperCase()}`, 140, 47);
      
      doc.setDrawColor(220, 220, 220);
      doc.line(20, 55, 190, 55);
      
      // Customer details & Shipping Address
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(44, 44, 44);
      doc.text("Billed To:", 20, 65);
      doc.text("Shipping Address:", 110, 65);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(order.customer_name || order.customer || "N/A", 20, 72);
      doc.text(order.customer_email || "N/A", 20, 77);
      doc.text(order.customer_phone || "N/A", 20, 82);
      
      // Address lines (wrap address nicely)
      const addressString = `${order.address || ""}, ${order.city || ""}, ${order.state || ""} - ${order.pincode || ""}`;
      const splitAddress = doc.splitTextToSize(addressString, 80);
      doc.text(splitAddress, 110, 72);
      
      doc.line(20, 95, 190, 95);
      
      // Table
      const tableData = (order.items || []).map((item, idx) => [
        idx + 1,
        item.product_name,
        `Rs. ${Number(item.price).toLocaleString("en-IN")}`,
        item.quantity,
        `Rs. ${(Number(item.price) * item.quantity).toLocaleString("en-IN")}`
      ]);
      
      autoTable(doc, {
        startY: 102,
        margin: { left: 20, right: 20 },
        head: [['S.No', 'Item Description', 'Unit Price', 'Qty', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [179, 135, 40], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 5 },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          2: { cellWidth: 30, halign: 'right' },
          3: { cellWidth: 15, halign: 'center' },
          4: { cellWidth: 35, halign: 'right' }
        }
      });
      
      // Totals section
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      
      // Payment details
      doc.text(`Payment Method: ${order.payment_method === "razorpay" ? "Online (Razorpay)" : "Cash on Delivery (COD)"}`, 20, finalY);
      if (order.razorpay_payment_id) {
        doc.text(`Payment ID: ${order.razorpay_payment_id}`, 20, finalY + 6);
      }
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(44, 44, 44);
      doc.text(`Total Amount Paid: Rs. ${Number(order.total).toLocaleString("en-IN")}`, 110, finalY);
      
      // Thank you message
      doc.setDrawColor(220, 220, 220);
      doc.line(20, finalY + 25, 190, finalY + 25);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text("Thank you for shopping with Trendy Glitterz! We hope you love your premium jewelry.", 20, finalY + 35);
      
      // Save doc
      doc.save(`Invoice-${order.id.split("-")[0].toUpperCase()}.pdf`);
      toast.success("Invoice PDF downloaded successfully!");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF invoice.");
    }
  };

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/login");
    }
  }, [isLoaded, isSignedIn, router]);

  const { getToken } = useAuth();

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || "",
        phone: (user.unsafeMetadata.phone as string) || "",
        address: (user.unsafeMetadata.address as string) || "",
        city: (user.unsafeMetadata.city as string) || "",
        state: (user.unsafeMetadata.state as string) || "",
        pincode: (user.unsafeMetadata.pincode as string) || "",
      });

      async function getOrders() {
        const token = await getToken();
        if (token) {
          const fetchedOrders = await useOrderStore.getState().fetchUserOrders(token);
          setOrders(fetchedOrders);
        }
      }
      getOrders();
    }
  }, [user, getToken]);

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      await user.update({
        firstName: profileForm.fullName.split(" ")[0] || "",
        lastName: profileForm.fullName.split(" ").slice(1).join(" ") || "",
        unsafeMetadata: {
          phone: profileForm.phone,
          address: profileForm.address,
          city: profileForm.city,
          state: profileForm.state,
          pincode: profileForm.pincode,
        },
      });
      setSaveMsg({ ok: true, text: "Profile updated successfully." });
      setEditing(false);
    } catch (e: any) {
      setSaveMsg({ ok: false, text: e.errors?.[0]?.message || "Failed to update profile." });
    }
    setTimeout(() => setSaveMsg(null), 4000);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      router.replace("/");
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  if (!isLoaded || !user) return null;

  const isProfileIncomplete = !profileForm.address || !profileForm.phone || !profileForm.city;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
    { id: "orders",  label: "Orders",  icon: <ShoppingBag className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-24">
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">

        {/* Incomplete profile reminder banner */}
        {isProfileIncomplete && (
          <div className="mb-8 flex items-start gap-4 p-4 rounded-xl border"
               style={{ background: "rgba(179,135,40,0.08)", borderColor: "rgba(179,135,40,0.3)" }}>
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm"
                 style={{ background: "rgba(179,135,40,0.15)" }}>
              ✏️
            </div>
            <div className="flex-1">
              <p className="text-sm font-sans font-semibold" style={{ color: "#D4AF37" }}>
                Complete your delivery details for smoother checkout
              </p>
              <p className="text-[11px] text-white/40 mt-1 leading-relaxed">
                Please fill in your phone, address, city, state, and pincode below.
                These will be auto-filled when you place an order — saving you time!
              </p>
            </div>
            <button
              onClick={() => setEditing(true)}
              className="flex-shrink-0 text-[10px] font-sans uppercase tracking-widest px-4 py-2 rounded-lg transition-colors font-semibold"
              style={{ background: "linear-gradient(to right, #BF953F, #B38728)", color: "#0A0A0A" }}
            >
              Fill Now
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-12 border-b border-white/5 pb-10">
          <div>
            <p className="text-[10px] font-sans uppercase tracking-[0.4em] mb-3"
               style={{ background: "linear-gradient(to right, #BF953F, #FCF6BA, #B38728)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontWeight: "bold" }}>
              My Account
            </p>
            <h1 className="text-4xl md:text-5xl font-serif text-white tracking-tighter">
              {user.fullName}
            </h1>
            <p className="text-xs text-white/30 font-sans mt-2">
              Member since {new Date(user.createdAt!).toLocaleDateString("en-IN", { year: "numeric", month: "long" })}
            </p>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-2 text-[10px] font-sans uppercase tracking-[0.2em] text-white/30 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-8">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2"
                   style={{ borderColor: "#B38728" }}>
                <Image src={user.imageUrl} alt="Avatar" fill className="object-cover" />
              </div>
              <div className="text-center">
                <p className="text-sm text-white font-sans font-medium">{user.fullName}</p>
                <p className="text-[10px] text-white/40 font-sans mt-0.5">{user.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>

            {/* Nav */}
            <nav className="space-y-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-sans transition-all duration-200 rounded-lg ${
                    tab === t.id
                      ? "text-[#0A0A0A]"
                      : "text-white/50 hover:bg-white/5 hover:text-white"
                  }`}
                  style={tab === t.id ? {
                    background: "linear-gradient(to right, #BF953F, #B38728)",
                  } : {}}
                >
                  {t.icon}
                  {t.label}
                  <ChevronRight className={`w-3.5 h-3.5 ml-auto transition-opacity ${tab === t.id ? "opacity-100" : "opacity-0"}`} />
                </button>
              ))}
            </nav>

            <div className="pt-4 border-t border-white/5">
              <Link href="/" className="text-[10px] font-sans uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors">
                ← Continue Shopping
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9">

            {/* Profile Tab */}
            {tab === "profile" && (
              <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-8 md:p-10">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-2xl font-serif text-white tracking-tight">Personal Information</h2>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-2 text-[10px] font-sans uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors border border-white/10 hover:border-white/30 px-4 py-2 rounded-lg"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                  )}
                </div>

                {saveMsg && (
                  <div className={`flex items-center gap-2 p-3 mb-6 text-xs font-sans rounded-lg ${saveMsg.ok ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20" : "bg-red-400/10 text-red-400 border border-red-400/20"}`}>
                    {saveMsg.ok ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {saveMsg.text}
                  </div>
                )}

                {editing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {(["fullName", "phone", "address", "city", "state", "pincode"] as const).map((field) => (
                      <div key={field} className={field === "address" ? "sm:col-span-2" : ""}>
                        <label className="text-[10px] font-sans uppercase tracking-[0.2em] text-white/40 block mb-2">
                          {field === "fullName" ? "Full Name" : field.charAt(0).toUpperCase() + field.slice(1)}
                        </label>
                        <div className="border-b border-white/20 focus-within:border-[#B38728] transition-colors pb-2">
                          <input
                            value={profileForm[field as keyof typeof profileForm]}
                            onChange={(e) => setProfileForm((p) => ({ ...p, [field]: e.target.value }))}
                            className="w-full bg-transparent text-white text-sm font-sans font-light focus:outline-none placeholder:text-white/20"
                            placeholder={`Enter ${field === "fullName" ? "full name" : field}`}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="sm:col-span-2 flex gap-4 pt-4">
                      <button
                        onClick={handleSaveProfile}
                        className="text-[11px] font-sans uppercase tracking-[0.15em] px-8 py-3 rounded-lg transition-colors text-[#0A0A0A] font-semibold"
                        style={{ background: "linear-gradient(to right, #BF953F, #B38728)" }}
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditing(false)}
                        className="text-white/40 text-[11px] font-sans uppercase tracking-[0.15em] px-8 py-3 border border-white/10 hover:border-white/30 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                    {[
                      { label: "Full Name",  value: user.fullName },
                      { label: "Email",      value: user.primaryEmailAddress?.emailAddress },
                      { label: "Phone",      value: profileForm.phone },
                      { label: "Address",    value: profileForm.address },
                      { label: "City",       value: profileForm.city },
                      { label: "State",      value: profileForm.state },
                      { label: "Pincode",    value: profileForm.pincode },
                    ].map((row) => (
                      <div key={row.label} className={row.label === "Address" ? "sm:col-span-2" : ""}>
                        <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-white/30 mb-1">{row.label}</p>
                        <p className="text-sm font-sans text-white">{row.value || <span className="text-white/20">—</span>}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {tab === "orders" && (
              <div>
                <h2 className="text-2xl font-serif text-white tracking-tight mb-8">Order History</h2>
                {orders.length === 0 ? (
                  <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-16 text-center">
                    <Package className="w-12 h-12 text-white/10 mx-auto mb-6" strokeWidth={1} />
                    <p className="font-serif text-2xl text-white/20 italic">No orders yet.</p>
                    <Link
                      href="/"
                      className="mt-6 inline-block text-[10px] font-sans uppercase tracking-[0.2em] px-6 py-2.5 rounded-lg transition-colors text-[#0A0A0A] font-semibold"
                      style={{ background: "linear-gradient(to right, #BF953F, #B38728)" }}
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 md:p-8 flex flex-col gap-6">
                        {/* Header Details */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/5">
                          <div className="grid grid-cols-2 sm:flex sm:items-center gap-x-8 gap-y-4">
                            <div>
                              <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-white/30 mb-1">Order ID</p>
                              <div className="flex items-center gap-1">
                                <p className="font-sans text-sm text-white font-medium">{order.id.split("-")[0].toUpperCase()}</p>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(order.id);
                                    toast.success("Order ID copied to clipboard!");
                                  }}
                                  className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                  title="Copy Full Order ID"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-white/30 mb-1">Date & Time</p>
                              <p className="font-sans text-sm text-white">{formatDate(order.created_at)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-white/30 mb-1">Total</p>
                              <p className="font-sans text-sm font-medium" style={{ color: "#B38728" }}>₹{Number(order.total).toLocaleString("en-IN")}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            {/* Payment status badge */}
                            {order.payment_method === "razorpay" ? (
                              <span className="flex items-center gap-1.5 text-[10px] font-sans font-medium uppercase tracking-[0.1em] px-3 py-1.5 rounded-full text-emerald-400 bg-emerald-400/10 border border-emerald-400/20">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Payment Verified
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-[10px] font-sans font-medium uppercase tracking-[0.1em] px-3 py-1.5 rounded-full text-amber-400 bg-amber-400/10 border border-amber-400/20">
                                <Clock className="w-3.5 h-3.5" />
                                Payment On Delivery (COD)
                              </span>
                            )}

                            {/* Delivery status badge */}
                            <span className={`text-[10px] font-sans uppercase tracking-[0.15em] px-3 py-1.5 rounded-full w-fit capitalize ${statusColor(order.status)}`}>
                              {order.status}
                            </span>

                            {/* Toggle button */}
                            <button
                              onClick={() => toggleOrderExpand(order.id)}
                              className="flex items-center gap-1.5 text-[10px] font-sans uppercase tracking-[0.15em] text-[#B38728] hover:text-white transition-colors ml-2 font-medium"
                            >
                              {expandedOrders[order.id] ? (
                                <>
                                  Hide Details
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </>
                              ) : (
                                <>
                                  View Details
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-4">
                          {order.items?.map((item) => (
                            <div key={item.id} className="flex items-center gap-4">
                              <div className="relative w-14 h-18 flex-shrink-0 rounded-lg overflow-hidden bg-white/5">
                                {item.product_image ? (
                                  <Image src={item.product_image} alt={item.product_name} fill className="object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white/20 text-xs text-center">No Img</div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-serif text-white text-sm truncate">{item.product_name}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-sm font-sans text-white">₹{Number(item.price).toLocaleString("en-IN")}</p>
                                <p className="text-[10px] font-sans text-white/30">Qty: {item.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Collapsible Details */}
                        {expandedOrders[order.id] && (
                          <div className="pt-6 border-t border-white/5 space-y-6 transition-all duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              {/* Shipping Info */}
                              <div className="space-y-4">
                                <h4 className="text-xs font-sans uppercase tracking-widest text-[#B38728] font-semibold">Delivery Information</h4>
                                <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4 space-y-3">
                                  <div>
                                    <span className="text-[10px] font-sans uppercase tracking-wider text-white/30 block">Customer Name</span>
                                    <span className="text-sm font-sans text-white">{order.customer_name || order.customer || "N/A"}</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-sans uppercase tracking-wider text-white/30 block">Email Address</span>
                                    <span className="text-sm font-sans text-white">{order.customer_email || "N/A"}</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-sans uppercase tracking-wider text-white/30 block">Phone Number</span>
                                    <span className="text-sm font-sans text-white">{order.customer_phone || "N/A"}</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-sans uppercase tracking-wider text-white/30 block">Shipping Address</span>
                                    <span className="text-sm font-sans text-white leading-relaxed">
                                      {order.address || "N/A"}
                                      {order.city && `, ${order.city}`}
                                      {order.state && `, ${order.state}`}
                                      {order.pincode && ` - ${order.pincode}`}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Payment & Transaction Info */}
                              <div className="space-y-4">
                                <h4 className="text-xs font-sans uppercase tracking-widest text-[#B38728] font-semibold">Payment & Transaction</h4>
                                <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4 space-y-3">
                                  <div>
                                    <span className="text-[10px] font-sans uppercase tracking-wider text-white/30 block">Payment Method</span>
                                    <span className="text-sm font-sans text-white capitalize">{order.payment_method === "razorpay" ? "Online Payment (Razorpay)" : "Cash on Delivery (COD)"}</span>
                                  </div>
                                  {order.payment_method === "razorpay" && (
                                    <>
                                      <div>
                                        <span className="text-[10px] font-sans uppercase tracking-wider text-white/30 block flex items-center justify-between">
                                          Razorpay Order ID
                                          <button
                                            onClick={() => {
                                              if (order.razorpay_order_id) {
                                                navigator.clipboard.writeText(order.razorpay_order_id);
                                                toast.success("Razorpay Order ID copied!");
                                              }
                                            }}
                                            className="text-[9px] text-[#B38728] hover:text-white transition-colors"
                                          >
                                            Copy
                                          </button>
                                        </span>
                                        <span className="text-xs font-mono text-white/80">{order.razorpay_order_id || "N/A"}</span>
                                      </div>
                                      <div>
                                        <span className="text-[10px] font-sans uppercase tracking-wider text-white/30 block flex items-center justify-between">
                                          Razorpay Payment ID
                                          <button
                                            onClick={() => {
                                              if (order.razorpay_payment_id) {
                                                navigator.clipboard.writeText(order.razorpay_payment_id);
                                                toast.success("Razorpay Payment ID copied!");
                                              }
                                            }}
                                            className="text-[9px] text-[#B38728] hover:text-white transition-colors"
                                          >
                                            Copy
                                          </button>
                                        </span>
                                        <span className="text-xs font-mono text-white/80">{order.razorpay_payment_id || "N/A"}</span>
                                      </div>
                                    </>
                                  )}
                                  <div>
                                    <span className="text-[10px] font-sans uppercase tracking-wider text-white/30 block">Order Notes</span>
                                    <p className="text-sm font-sans text-white/70 italic">{order.notes || "No special instructions/notes"}</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Actions / Full ID Footer */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-white/5">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-sans uppercase tracking-wider text-white/30">System Order ID:</span>
                                <span className="text-xs font-mono text-white/50 truncate max-w-[150px] sm:max-w-xs">{order.id}</span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(order.id);
                                    toast.success("System Order ID copied!");
                                  }}
                                  className="text-white/40 hover:text-white transition-colors p-1"
                                  title="Copy System Order ID"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <button
                                onClick={() => downloadInvoice(order)}
                                className="flex items-center justify-center gap-2 text-[10px] font-sans uppercase tracking-[0.2em] px-4 py-2.5 rounded-lg border border-white/10 hover:border-[#B38728] text-white hover:text-[#B38728] transition-all bg-white/5 font-semibold text-center cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Download Invoice
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </main>
        </div>
      </div>

      <LogoutModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />
    </div>
  );
}
