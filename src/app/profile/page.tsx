"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUserStore, Order } from "@/store/useUserStore";
import {
  User,
  ShoppingBag,
  Settings,
  LogOut,
  Edit3,
  Camera,
  ChevronRight,
  CheckCircle,
  XCircle,
  Package,
  Lock,
  Eye,
  EyeOff,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";

type Tab = "profile" | "orders" | "settings";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function statusColor(status: Order["status"]) {
  switch (status) {
    case "Delivered": return "text-green-600 bg-green-50";
    case "Shipped": return "text-blue-600 bg-blue-50";
    case "Processing": return "text-amber-600 bg-amber-50";
    case "Cancelled": return "text-red-500 bg-red-50";
  }
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoggedIn, logout, updateProfile, changePassword } = useUserStore();
  const [tab, setTab] = useState<Tab>("profile");
  const [mounted, setMounted] = useState(false);

  // Edit Profile — initialize once from user
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState(() => ({
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    address: user?.address ?? "",
    city: user?.city ?? "",
    state: user?.state ?? "",
    pincode: user?.pincode ?? "",
  }));
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Change Password
  const [pwForm, setPwForm] = useState({ old: "", newPw: "", confirm: "" });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Avatar
  const avatarRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (mounted && !isLoggedIn) router.push("/login");
  }, [mounted, isLoggedIn, router]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateProfile({ avatar: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    updateProfile(profileForm);
    setSaveMsg({ ok: true, text: "Profile updated successfully." });
    setEditing(false);
    setTimeout(() => setSaveMsg(null), 4000);
  };

  const handleChangePassword = () => {
    setPwMsg(null);
    if (!pwForm.old || !pwForm.newPw || !pwForm.confirm) {
      setPwMsg({ ok: false, text: "Please fill in all password fields." });
      return;
    }
    if (pwForm.newPw.length < 8) {
      setPwMsg({ ok: false, text: "New password must be at least 8 characters." });
      return;
    }
    if (pwForm.newPw !== pwForm.confirm) {
      setPwMsg({ ok: false, text: "Passwords do not match." });
      return;
    }
    const result = changePassword(pwForm.old, pwForm.newPw);
    if (result.success) {
      setPwForm({ old: "", newPw: "", confirm: "" });
      setPwMsg({ ok: true, text: "Password changed successfully." });
    } else {
      setPwMsg({ ok: false, text: result.error || "Failed." });
    }
    setTimeout(() => setPwMsg(null), 5000);
  };

  if (!mounted || !user) return null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
    { id: "orders", label: "Orders", icon: <ShoppingBag className="w-4 h-4" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
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
              Member since {new Date(user.joinedAt).toLocaleDateString("en-IN", { year: "numeric", month: "long" })}
            </p>
          </div>
          <button
            onClick={() => { logout(); router.push("/"); }}
            className="flex items-center gap-2 text-[10px] font-sans uppercase tracking-[0.2em] text-obsidian/40 hover:text-burgundy transition-colors border-b border-transparent hover:border-burgundy pb-0.5"
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
              <div
                className="relative w-24 h-24 rounded-full bg-sand/50 overflow-hidden border-2 border-obsidian/10 cursor-pointer group"
                onClick={() => avatarRef.current?.click()}
              >
                {user.avatar ? (
                  <Image src={user.avatar} alt="Avatar" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-3xl font-serif text-obsidian/40">
                      {user.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-obsidian/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-5 h-5 text-alabaster" />
                </div>
              </div>
              <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              <p className="text-xs font-sans text-obsidian/40">Tap photo to change</p>
            </div>

            {/* Nav */}
            <nav className="space-y-1">
              {useUserStore.getState().isAdmin && (
                <Link
                  href="/admin"
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-sans transition-all duration-200 rounded-sm text-white bg-[#E8809A] hover:bg-[#D66A84] mb-4 shadow-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Admin Dashboard
                  <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-70" />
                </Link>
              )}
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

            {/* ─── Profile Tab ─── */}
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
                    {(["fullName", "email", "phone", "address", "city", "state", "pincode"] as const).map((field) => (
                      <div key={field} className={field === "address" ? "sm:col-span-2" : ""}>
                        <label className="text-[10px] font-sans uppercase tracking-[0.2em] text-obsidian/40 block mb-2">
                          {field === "fullName" ? "Full Name" : field.charAt(0).toUpperCase() + field.slice(1)}
                        </label>
                        <div className="border-b border-obsidian/20 focus-within:border-obsidian transition-colors pb-2">
                          <input
                            value={profileForm[field]}
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
                      { label: "Email", value: user.email },
                      { label: "Phone", value: user.phone },
                      { label: "Address", value: user.address },
                      { label: "City", value: user.city },
                      { label: "State", value: user.state },
                      { label: "Pincode", value: user.pincode },
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

            {/* ─── Orders Tab ─── */}
            {tab === "orders" && (
              <div>
                <h2 className="text-2xl font-serif text-obsidian tracking-tight mb-8">Order History</h2>
                {user.orders.length === 0 ? (
                  <div className="bg-white border border-obsidian/8 p-16 text-center">
                    <Package className="w-12 h-12 text-obsidian/20 mx-auto mb-6" strokeWidth={1} />
                    <p className="font-serif text-2xl text-obsidian/30 italic">No orders yet.</p>
                    <Link href="/" className="mt-6 inline-block text-[10px] font-sans uppercase tracking-[0.2em] border-b border-obsidian pb-0.5 text-obsidian hover:text-burgundy hover:border-burgundy transition-colors">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {user.orders.map((order) => (
                      <div key={order.id} className="bg-white border border-obsidian/8 p-6 md:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-obsidian/8">
                          <div>
                            <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-obsidian/40 mb-1">Order ID</p>
                            <p className="font-sans text-sm text-obsidian font-medium">{order.id}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-obsidian/40 mb-1">Date & Time</p>
                            <p className="font-sans text-sm text-obsidian">{formatDate(order.date)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-obsidian/40 mb-1">Total</p>
                            <p className="font-sans text-sm text-obsidian font-medium">₹{order.total.toFixed(2)}</p>
                          </div>
                          <span className={`text-[10px] font-sans uppercase tracking-[0.15em] px-3 py-1.5 rounded-full w-fit ${statusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="space-y-4">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-4">
                              <div className="relative w-14 h-18 flex-shrink-0 rounded-lg overflow-hidden bg-sand/30">
                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-serif text-obsidian text-sm truncate">{item.name}</p>
                                <p className="text-[10px] font-sans uppercase tracking-widest text-obsidian/40">{item.category}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-sm font-sans text-obsidian">₹{item.price.toFixed(2)}</p>
                                <p className="text-[10px] font-sans text-obsidian/40">Qty: {item.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        {order.address && (
                          <p className="text-[10px] font-sans text-obsidian/40 mt-6 pt-4 border-t border-obsidian/5">
                            Delivered to: {order.address}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── Settings Tab ─── */}
            {tab === "settings" && (
              <div className="bg-white border border-obsidian/8 p-8 md:p-12">
                <h2 className="text-2xl font-serif text-obsidian tracking-tight mb-10">Security Settings</h2>

                <div className="flex items-start gap-4 mb-8">
                  <Lock className="w-5 h-5 text-dustyrose mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <h3 className="text-sm font-sans font-medium text-obsidian mb-1">Change Password</h3>
                    <p className="text-xs font-sans text-obsidian/40">Use a strong password of at least 8 characters.</p>
                  </div>
                </div>

                <div className="space-y-8 max-w-md">
                  {[
                    { label: "Current Password", key: "old" as const, show: showOld, toggle: () => setShowOld(!showOld) },
                    { label: "New Password", key: "newPw" as const, show: showNew, toggle: () => setShowNew(!showNew) },
                    { label: "Confirm New Password", key: "confirm" as const, show: showNew, toggle: () => setShowNew(!showNew) },
                  ].map(({ label, key, show, toggle }) => (
                    <div key={key}>
                      <label className="text-[10px] font-sans uppercase tracking-[0.2em] text-obsidian/40 block mb-2">{label}</label>
                      <div className="border-b border-obsidian/20 focus-within:border-obsidian transition-colors pb-2 flex items-center gap-2">
                        <input
                          type={show ? "text" : "password"}
                          value={pwForm[key]}
                          onChange={(e) => setPwForm((p) => ({ ...p, [key]: e.target.value }))}
                          placeholder="••••••••"
                          className="flex-1 bg-transparent text-obsidian text-sm font-sans font-light placeholder:text-obsidian/20 focus:outline-none"
                        />
                        <button type="button" onClick={toggle} className="text-obsidian/30 hover:text-obsidian transition-colors">
                          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}

                  {pwMsg && (
                    <div className={`flex items-center gap-2 p-3 text-xs font-sans ${pwMsg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                      {pwMsg.ok ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {pwMsg.text}
                    </div>
                  )}

                  <button
                    onClick={handleChangePassword}
                    className="bg-dustyrose text-alabaster text-[11px] font-sans uppercase tracking-[0.15em] px-8 py-3 hover:bg-dustyrose/80 transition-colors"
                  >
                    Update Password
                  </button>
                </div>

                <div className="mt-16 pt-8 border-t border-obsidian/10">
                  <h3 className="text-sm font-sans font-medium text-obsidian mb-4">Danger Zone</h3>
                  <button
                    onClick={() => { logout(); router.push("/"); }}
                    className="flex items-center gap-2 text-[11px] font-sans uppercase tracking-[0.15em] text-red-500 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out of All Devices
                  </button>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
