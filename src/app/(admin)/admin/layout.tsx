"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
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
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import { LogoutModal } from "@/components/ui/LogoutModal";

// ─── Nav Items ───────────────────────────────────────────────────────────────

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Products", href: "/admin/products", icon: Gem },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

const mobileNavItems = [
  { label: "Home", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Products", href: "/admin/products", icon: Gem },
  { label: "Customers", href: "/admin/customers", icon: Users },
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

// ─── Top Header ───────────────────────────────────────────────────────────────

function TopHeader({ pathname }: { pathname: string }) {
  const breadcrumbs = useBreadcrumbs(pathname);
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
      <div className="relative w-64">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ccc]" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full bg-[#FAFAF8] border border-[#F0EDE8] rounded-full pl-8 pr-4 py-2 text-xs text-[#555] focus:outline-none focus:ring-2 focus:ring-[#F5B8C8]/20 transition-all"
        />
      </div>
      <div className="flex items-center gap-2">
        <button className="w-8 h-8 rounded-full bg-[#FAFAF8] border border-[#F0EDE8] flex items-center justify-center relative">
          <Bell size={14} className="text-[#888]" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#E8809A] rounded-full" />
        </button>
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
    <div className="min-h-screen bg-[#FAFAF8]">
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
