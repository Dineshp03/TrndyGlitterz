"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Gem,
  Users,
  Settings,
  Search,
  Bell,
  ChevronRight,
  LogOut,
  ExternalLink,
  Home,
  CheckCheck,
  Trash2,
  Info,
  Package,
  AlertTriangle,
} from "lucide-react";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useUser, useClerk } from "@clerk/nextjs";
import { LogoutModal } from "@/components/ui/LogoutModal";
import { getSupabaseClient } from "@/lib/supabase";
import { toast } from "sonner";

// ─── Nav Items ───────────────────────────────────────────────────────────────

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Products", href: "/admin/products", icon: Gem },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

const mobileNavItems = [
  { label: "Store", href: "/", icon: Home },
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Products", href: "/admin/products", icon: Gem },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

// ─── Admin Check helper ──────────────────────────────────────────────────────

const ADMIN_EMAILS = ["trendyglitterzz@gmail.com", "admin@trendyglitterz.com"];

function checkIsAdmin(user: any) {
  if (!user) return false;
  // check email
  const email = user.primaryEmailAddress?.emailAddress;
  if (email && ADMIN_EMAILS.includes(email)) return true;
  // check metadata
  if (user.publicMetadata?.role === "admin") return true;
  return false;
}

// ─── Breadcrumb helper ────────────────────────────────────────────────────────

function useBreadcrumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  return parts.map((part, i) => ({
    label: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " "),
    href: "/" + parts.slice(0, i + 1).join("/"),
    isLast: i === parts.length - 1,
  }));
}

// ─── Desktop Sidebar ─────────────────────────────────────────────────────────

function DesktopSidebar({ pathname, user, onLogout }: { pathname: string; user: any; onLogout: () => void }) {
  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-[#F0EDE8] z-40 shadow-sm">
      <div className="h-16 flex items-center px-6 border-b border-[#F0EDE8]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#F5B8C8] to-[#E8809A] flex items-center justify-center shadow-sm">
            <Gem size={13} className="text-white" />
          </div>
          <span className="font-serif text-[#2C2C2C] tracking-tight text-sm font-bold leading-tight">
            TRENDY<br />
            <span className="text-[#E8809A]">GLITTERZ</span>
          </span>
        </div>
        <span className="ml-3 text-[9px] font-mono text-[#aaa] uppercase tracking-[0.15em] bg-[#F5B8C8]/20 border border-[#F5B8C8]/40 px-1.5 py-0.5 rounded">
          Admin
        </span>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <p className="text-[9px] font-mono text-[#bbb] uppercase tracking-[0.2em] mb-3 px-3">Menu</p>
        {navItems.map((item) => {
          const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#F5B8C8]/20 text-[#E8809A] border border-[#F5B8C8]/50"
                  : "text-[#555] hover:bg-[#FAFAF8] hover:text-[#2C2C2C]"
              }`}
            >
              <Icon size={16} className={`flex-shrink-0 transition-colors ${isActive ? "text-[#E8809A]" : "text-[#aaa] group-hover:text-[#555]"}`} />
              <span className="flex-1">{item.label}</span>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#E8809A]" />}
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-[#F0EDE8]/60">
          <Link
            href="/"
            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#555] hover:bg-obsidian hover:text-white transition-all duration-300"
          >
            <ExternalLink size={16} className="text-[#aaa] group-hover:text-white" />
            <span className="flex-1">View Store</span>
          </Link>
        </div>
      </nav>

      <div className="p-4 border-t border-[#F0EDE8]">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-red-50 cursor-pointer transition-colors group mb-2"
        >
           <LogOut size={14} className="text-[#aaa] group-hover:text-red-400" />
           <span className="text-xs text-[#888] group-hover:text-red-500 font-medium">Logout</span>
        </button>
        <div className="flex items-center gap-3 px-2 py-1 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F5B8C8] to-[#E8809A] flex items-center justify-center text-white text-xs font-bold overflow-hidden shadow-sm">
            {user?.imageUrl ? <img src={user.imageUrl} alt="" className="w-full h-full object-cover" /> : user?.firstName?.[0] || 'A'}
          </div>
          <div className="flex-1 min-w-0">
             <p className="text-xs font-medium text-[#2C2C2C] truncate">{user?.fullName}</p>
             <p className="text-[10px] text-[#aaa] truncate">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Notification icon map ────────────────────────────────────────────────────

const notifIconMap = {
  order: Package,
  stock: AlertTriangle,
  message: Info,
  system: Info,
};

// ─── Top Header ───────────────────────────────────────────────────────────────

function TopHeader({ pathname }: { pathname: string }) {
  const breadcrumbs = useBreadcrumbs(pathname);
  const router = useRouter();
  const { notifications, markAllAsRead, clearNotifications } = useNotificationStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close bell dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (q: string) => {
    const query = q.trim().toLowerCase();
    if (!query) return;
    if (["order", "orders"].some((k) => query.includes(k))) {
      router.push("/admin/orders");
    } else if (["product", "products", "item"].some((k) => query.includes(k))) {
      router.push("/admin/products");
    } else if (["customer", "customers", "user", "users"].some((k) => query.includes(k))) {
      router.push("/admin/customers");
    } else if (["setting", "settings"].some((k) => query.includes(k))) {
      router.push("/admin/settings");
    } else {
      // Default: go to orders and let page-level search handle it
      router.push(`/admin/orders`);
    }
    setSearchQuery("");
  };

  return (
    <header className="hidden md:flex fixed top-0 left-64 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-[#F0EDE8] z-30 items-center px-6 gap-4">
      <nav className="flex items-center gap-1.5 flex-1 min-w-0">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={11} className="text-[#ccc]" />}
            <Link
              href={crumb.href}
              className={`text-xs font-mono uppercase tracking-[0.12em] transition-colors ${
                crumb.isLast ? "text-[#2C2C2C] font-semibold" : "text-[#bbb] hover:text-[#888]"
              }`}
            >
              {crumb.label}
            </Link>
          </span>
        ))}
      </nav>

      {/* Search */}
      <div className="relative w-64">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ccc]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSearch(searchQuery); }}
          placeholder="Search orders, products…"
          className="w-full bg-[#FAFAF8] border border-[#F0EDE8] rounded-full pl-8 pr-9 py-2 text-xs text-[#555] focus:outline-none focus:ring-2 focus:ring-[#F5B8C8]/30 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => handleSearch(searchQuery)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#E8809A] hover:text-[#d4607a] transition-colors"
          >
            <ChevronRight size={13} />
          </button>
        )}
      </div>

      {/* Bell */}
      <div className="flex items-center gap-2" ref={bellRef}>
        <button
          onClick={() => { setBellOpen((v) => !v); if (!bellOpen) markAllAsRead(); }}
          className="w-8 h-8 rounded-full bg-[#FAFAF8] border border-[#F0EDE8] flex items-center justify-center relative hover:bg-[#F5B8C8]/20 transition-colors"
        >
          <Bell size={14} className="text-[#888]" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 bg-[#E8809A] rounded-full flex items-center justify-center text-[8px] text-white font-bold px-0.5">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown panel */}
        {bellOpen && (
          <div className="absolute top-14 right-6 w-80 bg-white rounded-2xl border border-[#F0EDE8] shadow-xl z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#F0EDE8]">
              <p className="text-xs font-semibold text-[#2C2C2C] font-mono uppercase tracking-widest">Notifications</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={markAllAsRead}
                  title="Mark all as read"
                  className="text-[#aaa] hover:text-[#E8809A] transition-colors"
                >
                  <CheckCheck size={13} />
                </button>
                <button
                  onClick={clearNotifications}
                  title="Clear all"
                  className="text-[#aaa] hover:text-red-400 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-[#F0EDE8]">
              {notifications.length === 0 ? (
                <div className="py-8 flex flex-col items-center gap-2 text-[#ccc]">
                  <Bell size={20} />
                  <p className="text-xs font-mono">No notifications yet</p>
                </div>
              ) : (
                notifications.slice(0, 20).map((n) => {
                  const Icon = notifIconMap[n.type] || Info;
                  return (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                        n.read ? "bg-white" : "bg-[#FFF5F8]"
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full bg-[#F5B8C8]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon size={13} className="text-[#E8809A]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#2C2C2C] leading-tight">{n.title}</p>
                        <p className="text-[11px] text-[#888] mt-0.5 leading-snug">{n.message}</p>
                        <p className="text-[10px] text-[#ccc] mt-1">
                          {new Date(n.timestamp).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                        </p>
                      </div>
                      {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-[#E8809A] flex-shrink-0 mt-1.5" />}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

// ─── Mobile Bottom Bar ────────────────────────────────────────────────────────

function MobileBottomBar({ pathname }: { pathname: string }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-[#F0EDE8] pb-safe">
      <div className="flex items-stretch">
        {mobileNavItems.map((item) => {
          const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 relative group"
            >
              {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#E8809A] rounded-full" />}
              <Icon size={18} className={`transition-all duration-200 ${isActive ? "text-[#E8809A] scale-110" : "text-[#bbb] group-hover:text-[#888]"}`} />
              <span className={`text-[9px] font-mono uppercase tracking-[0.08em] transition-colors ${isActive ? "text-[#E8809A] font-semibold" : "text-[#ccc]"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  
  const [isAuthorizing, setIsAuthorizing] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { addNotification } = useNotificationStore();

  // Handle Notifications and Realtime Orders
  useEffect(() => {
    if (!isSignedIn || !checkIsAdmin(user)) return;

    // 1. Request Browser Notification Permission
    if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission();
    }

    // 2. Setup Supabase Realtime for New Orders
    const supabase = getSupabaseClient();
    const channel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const newOrder = payload.new;
          
          // Add to internal store for bell dropdown
          addNotification({
            title: "New Order Received! 🛍️",
            message: `${newOrder.customer_name} placed an order for ₹${newOrder.total}`,
            type: "order",
          });

          // Show browser popup if allowed
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("New Order! 🛍️", {
              body: `${newOrder.customer_name} placed an order for ₹${newOrder.total}`,
              icon: "/favicon.png",
            });
          } else {
             toast.success(`New order from ${newOrder.customer_name}!`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSignedIn, user, addNotification]);

  useEffect(() => {
    if (isLoaded) {
      const isAdmin = checkIsAdmin(user);
      if (!isSignedIn || !isAdmin) {
        router.replace("/login");
      } else {
        setIsAuthorizing(false);
      }
    }
  }, [isLoaded, isSignedIn, user, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      router.replace("/login");
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  if (!isLoaded || isAuthorizing) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#F5B8C8] border-t-transparent animate-spin mb-4" />
        <p className="text-xs font-mono text-[#bbb] uppercase tracking-widest">Verifying Admin Access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] admin-theme text-obsidian">
      <DesktopSidebar pathname={pathname} user={user} onLogout={() => setShowLogoutConfirm(true)} />
      <TopHeader pathname={pathname} />
      <main className="pt-0 pb-20 md:ml-64 md:pt-16 md:pb-0">
        {children}
      </main>
      <MobileBottomBar pathname={pathname} />
      <LogoutModal 
        isOpen={showLogoutConfirm} 
        onClose={() => setShowLogoutConfirm(false)} 
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />
    </div>
  );
}
