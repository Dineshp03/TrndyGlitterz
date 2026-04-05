"use client";

import { useState, useEffect } from "react";
export const dynamic = "force-dynamic";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useClerk, useUser } from "@clerk/nextjs";
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
} from "lucide-react";
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
    case "delivered": return "text-green-600 bg-green-50";
    case "shipped": return "text-blue-600 bg-blue-50";
    case "processing": return "text-amber-600 bg-amber-50";
    case "cancelled": return "text-red-500 bg-red-50";
    case "pending": return "text-gray-600 bg-gray-50";
    default: return "text-gray-600 bg-gray-50";
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

  // Redirect if not logged in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/login"); // fallback though middleware handles it
    }
  }, [isLoaded, isSignedIn, router]);

  // Load User Data & Orders
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

      // Load orders
      useOrderStore.getState().fetchUserOrders(user.id).then(fetchedOrders => {
         setOrders(fetchedOrders);
      });
    }
  }, [user]);

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
        }
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

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
    { id: "orders", label: "Orders", icon: <ShoppingBag className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-alabaster pt-24 pb-24">
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-12">
          <div>
            <p className="text-[10px] font-sans uppercase tracking-[0.4em] text-dustyrose mb-2">
              My Account
            </p>
            <h1 className="text-4xl md:text-5xl font-serif text-obsidian tracking-tighter">
              {user.fullName}
            </h1>
            <p className="text-xs text-obsidian/40 font-sans mt-2">
              Member since {new Date(user.createdAt!).toLocaleDateString("en-IN", { year: "numeric", month: "long" })}
            </p>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-2 text-[10px] font-sans uppercase tracking-[0.2em] text-obsidian/40 hover:text-burgundy transition-colors border-b border-transparent hover:border-burgundy pb-0.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-8">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-24 h-24 rounded-full bg-sand/50 overflow-hidden border-2 border-obsidian/10">
                <Image src={user.imageUrl} alt="Avatar" fill className="object-cover" />
              </div>
            </div>

            <nav className="space-y-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-sans transition-all duration-200 rounded-sm ${
                    tab === t.id
                      ? "bg-dustyrose text-alabaster"
                      : "text-obsidian/60 hover:bg-sand/40 hover:text-obsidian"
                  }`}
                >
                  {t.icon}
                  {t.label}
                  <ChevronRight className={`w-3.5 h-3.5 ml-auto transition-opacity ${tab === t.id ? "opacity-100" : "opacity-0"}`} />
                </button>
              ))}
            </nav>
            <div className="pt-4 border-t border-obsidian/10">
              <Link href="/" className="text-[10px] font-sans uppercase tracking-[0.2em] text-obsidian/40 hover:text-obsidian transition-colors">
                ← Continue Shopping
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9">
            {tab === "profile" && (
              <div className="bg-white border border-obsidian/8 p-8 md:p-12">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-2xl font-serif text-obsidian tracking-tight">Personal Information</h2>
                  {!editing && (
                    <button onClick={() => setEditing(true)} className="flex items-center gap-2 text-[10px] font-sans uppercase tracking-[0.2em] text-obsidian/50 hover:text-obsidian transition-colors">
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                  )}
                </div>

                {saveMsg && (
                  <div className={`flex items-center gap-2 p-3 mb-6 text-xs font-sans ${saveMsg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                    {saveMsg.ok ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {saveMsg.text}
                  </div>
                )}

                {editing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {(["fullName", "phone", "address", "city", "state", "pincode"] as const).map((field) => (
                      <div key={field} className={field === "address" ? "sm:col-span-2" : ""}>
                        <label className="text-[10px] font-sans uppercase tracking-[0.2em] text-obsidian/40 block mb-2">
                          {field === "fullName" ? "Full Name" : field.charAt(0).toUpperCase() + field.slice(1)}
                        </label>
                        <div className="border-b border-obsidian/20 focus-within:border-obsidian transition-colors pb-2">
                          <input
                            value={profileForm[field as keyof typeof profileForm]}
                            onChange={(e) => setProfileForm((p) => ({ ...p, [field]: e.target.value }))}
                            className="w-full bg-transparent text-obsidian text-sm font-sans font-light focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                    <div className="sm:col-span-2 flex gap-4 pt-4">
                      <button onClick={handleSaveProfile} className="bg-dustyrose text-alabaster text-[11px] font-sans uppercase tracking-[0.15em] px-8 py-3 hover:bg-dustyrose/80 transition-colors">
                        Save Changes
                      </button>
                      <button onClick={() => setEditing(false)} className="text-obsidian/40 text-[11px] font-sans uppercase tracking-[0.15em] px-8 py-3 border border-obsidian/20 hover:border-obsidian transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                    {[
                      { label: "Full Name", value: user.fullName },
                      { label: "Email", value: user.primaryEmailAddress?.emailAddress },
                      { label: "Phone", value: profileForm.phone },
                      { label: "Address", value: profileForm.address },
                      { label: "City", value: profileForm.city },
                      { label: "State", value: profileForm.state },
                      { label: "Pincode", value: profileForm.pincode },
                    ].map((row) => (
                      <div key={row.label} className={row.label === "Address" ? "sm:col-span-2" : ""}>
                        <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-obsidian/40 mb-1">{row.label}</p>
                        <p className="text-sm font-sans text-obsidian">{row.value || "—"}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "orders" && (
              <div>
                <h2 className="text-2xl font-serif text-obsidian tracking-tight mb-8">Order History</h2>
                {orders.length === 0 ? (
                  <div className="bg-white border border-obsidian/8 p-16 text-center">
                    <Package className="w-12 h-12 text-obsidian/20 mx-auto mb-6" strokeWidth={1} />
                    <p className="font-serif text-2xl text-obsidian/30 italic">No orders yet.</p>
                    <Link href="/" className="mt-6 inline-block text-[10px] font-sans uppercase tracking-[0.2em] border-b border-obsidian pb-0.5 text-obsidian hover:text-burgundy hover:border-burgundy transition-colors">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-white border border-obsidian/8 p-6 md:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-obsidian/8">
                          <div>
                            <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-obsidian/40 mb-1">Order ID</p>
                            <p className="font-sans text-sm text-obsidian font-medium">{order.id.split("-")[0]}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-obsidian/40 mb-1">Date & Time</p>
                            <p className="font-sans text-sm text-obsidian">{formatDate(order.created_at)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-obsidian/40 mb-1">Total</p>
                            <p className="font-sans text-sm text-obsidian font-medium">₹{order.total}</p>
                          </div>
                          <span className={`text-[10px] font-sans uppercase tracking-[0.15em] px-3 py-1.5 rounded-full w-fit capitalize ${statusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="space-y-4">
                          {order.items?.map((item) => (
                            <div key={item.id} className="flex items-center gap-4">
                              <div className="relative w-14 h-18 flex-shrink-0 rounded-lg overflow-hidden bg-sand/30">
                                {item.product_image ? (
                                  <Image src={item.product_image} alt={item.product_name} fill className="object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs text-center border">No Img</div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-serif text-obsidian text-sm truncate">{item.product_name}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-sm font-sans text-obsidian">₹{item.price}</p>
                                <p className="text-[10px] font-sans text-obsidian/40">Qty: {item.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        {order.address && (
                          <p className="text-[10px] font-sans text-obsidian/40 mt-6 pt-4 border-t border-obsidian/5">
                            Delivered to: {order.address}, {order.city}, {order.state} - {order.pincode}
                          </p>
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
