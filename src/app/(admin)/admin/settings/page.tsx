"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Store, Bell, Shield, CreditCard, Palette, ChevronRight, Globe, Package, Truck, X, AlertTriangle, Check, LucideIcon
} from "lucide-react";
import { useProductStore } from "@/store/useProductStore";
import { useOrderStore } from "@/store/useOrderStore";
import { useSettingsStore } from "@/store/useSettingsStore";

type SettingType = "text" | "select" | "number";

interface SettingItem {
  id: string;
  label: string;
  value: string;
  prefix?: string;
  desc: string;
  type: SettingType;
  options?: string[];
}

interface SettingGroup {
  title: string;
  icon: LucideIcon;
  items: SettingItem[];
}

const initialSettingGroups: SettingGroup[] = [
  {
    title: "Store",
    icon: Store,
    items: [
      { id: "store-name", label: "Store Name", value: "TRENDY GLITTERZ", desc: "Your public brand name", type: "text" },
      { id: "store-url", label: "Store URL", value: "trendyglitterz.com", desc: "Your store domain", type: "text" },
      { id: "country", label: "Country", value: "India (IN)", desc: "Store location and currency", type: "select", options: ["India (IN)", "United States (US)", "United Kingdom (UK)", "Australia (AU)", "Canada (CA)"] },
    ],
  },
  {
    title: "Notifications",
    icon: Bell,
    items: [
      { id: "newOrdersNotif", label: "New Orders", value: "Enabled", desc: "Get alerts for new orders", type: "select", options: ["Enabled", "Disabled"] },
      { id: "lowStockNotif", label: "Low Stock", value: "Enabled", desc: "Alert when stock runs low", type: "select", options: ["Enabled", "Disabled"] },
      { id: "msgNotif", label: "Customer Messages", value: "Disabled", desc: "Email notifications for inquiries", type: "select", options: ["Enabled", "Disabled"] },
    ],
  },
  {
    title: "Payments",
    icon: CreditCard,
    items: [
      { id: "upiEnabled", label: "UPI (Legacy)", value: "Retired", desc: "No longer in use", type: "select", options: ["Connected", "Disconnected"] },
      { id: "razorpayEnabled", label: "Razorpay", value: "Connected", desc: "Online payments gateway", type: "select", options: ["Connected", "Disconnected"] },
      { id: "codEnabled", label: "Cash on Delivery", value: "Disabled", desc: "Offline payment option", type: "select", options: ["Enabled", "Disabled"] },
    ],
  },
  {
    title: "Shipping",
    icon: Truck,
    items: [
      { id: "free-shipping", label: "Free Shipping Threshold", value: "999", prefix: "₹", desc: "Offer free shipping above this", type: "number" },
      { id: "standard-del", label: "Standard Delivery", value: "3-5 days", desc: "Default delivery window", type: "select", options: ["1-2 days", "3-5 days", "5-7 days", "7-10 days", "Not available"] },
      { id: "express-del", label: "Express Delivery", value: "1-2 days", desc: "Premium delivery option", type: "select", options: ["Same day", "1-2 days", "2-3 days", "Not available"] },
    ],
  },
];

const initialQuickToggles = [
  { id: "maintenance", label: "Maintenance Mode", desc: "Take your store offline temporarily", enabled: false, icon: Globe },
  { id: "new-badge", label: "New Arrivals Badge", desc: "Show 'New' badge on recent products", enabled: true, icon: Package },
  { id: "dark-mode", label: "Dark Mode Theme", desc: "Enable dark storefront option", enabled: false, icon: Palette },
  { id: "2fa", label: "Two-Factor Auth", desc: "Extra security for admin login", enabled: true, icon: Shield },
];

export default function SettingsPage() {
  const { getToken } = useAuth();
  const { deleteAllProducts } = useProductStore();
  const { deleteAllOrders } = useOrderStore();
  const settingsStore = useSettingsStore();

  const [toggles, setToggles] = useState(() => [
    { id: "maintenance", label: "Maintenance Mode", desc: "Take your store offline temporarily", enabled: settingsStore.maintenanceMode, icon: Globe },
    { id: "new-badge", label: "New Arrivals Badge", desc: "Show 'New' badge on recent products", enabled: settingsStore.newBadgeEnabled, icon: Package },
    { id: "dark-mode", label: "Dark Mode Theme", desc: "Enable dark storefront option", enabled: settingsStore.darkMode, icon: Palette },
    { id: "2fa", label: "Two-Factor Auth", desc: "Extra security for admin login", enabled: true, icon: Shield },
  ]);
  const [groups, setGroups] = useState(() => {
    const defaultGroups = [...initialSettingGroups];
    
    // Notifications Mapping
    const notifs = defaultGroups.find(g => g.title === "Notifications");
    if (notifs) {
      const g = notifs.items;
      g.find(i => i.id === "newOrdersNotif")!.value = settingsStore.newOrdersNotif ? "Enabled" : "Disabled";
      g.find(i => i.id === "lowStockNotif")!.value = settingsStore.lowStockNotif ? "Enabled" : "Disabled";
      g.find(i => i.id === "msgNotif")!.value = settingsStore.msgNotif ? "Enabled" : "Disabled";
    }

    // Payments Mapping
    const payments = defaultGroups.find(g => g.title === "Payments");
    if (payments) {
      const p = payments.items;
      p.find(i => i.id === "upiEnabled")!.value = settingsStore.upiEnabled ? "Connected" : "Disconnected";
      p.find(i => i.id === "razorpayEnabled")!.value = settingsStore.razorpayEnabled ? "Connected" : "Disconnected";
      p.find(i => i.id === "codEnabled")!.value = settingsStore.codEnabled ? "Enabled" : "Disabled";
    }

    const shippingGroup = defaultGroups.find(g => g.title === "Shipping");
    if (shippingGroup) {
      const freeShippingItem = shippingGroup.items.find(i => i.id === "shipping-details");
      if (!freeShippingItem) {
        shippingGroup.items.unshift({
          id: "shipping-details",
          label: "Shipping Info Text",
          value: settingsStore.shippingDetails,
          desc: "Display free shipping banner info",
          type: "text"
        });
      }
    }
    return defaultGroups;
  });
  
  // Edit Setting Modal
  const [editingSetting, setEditingSetting] = useState<{ groupIdx: number, itemIdx: number, item: SettingItem } | null>(null);
  const [editValue, setEditValue] = useState("");

  // Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  // Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const displayToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleToggle = (id: string) => {
    const newToggles = toggles.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t);
    setToggles(newToggles);
    
    const toggle = newToggles.find(t => t.id === id);
    if (!toggle) return;

    // Sync with store
    if (id === "maintenance") settingsStore.updateToggle("maintenanceMode", toggle.enabled);
    if (id === "new-badge") settingsStore.updateToggle("newBadgeEnabled", toggle.enabled);
    if (id === "dark-mode") settingsStore.updateToggle("darkMode", toggle.enabled);
    
    displayToast(`${toggle.label} ${toggle.enabled ? 'Enabled' : 'Disabled'}`);
  };

  const openEditModal = (groupIdx: number, itemIdx: number) => {
    const item = groups[groupIdx].items[itemIdx];
    setEditingSetting({ groupIdx, itemIdx, item });
    setEditValue(item.value);
  };

  const saveSetting = () => {
    if (!editingSetting) return;

    const { groupIdx, itemIdx } = editingSetting;
    const item = groups[groupIdx].items[itemIdx];

    const value = editValue || "Not set";

    if (item.id === "shipping-details") {
      settingsStore.updateShippingDetails(value);
    } else if (item.id === "newOrdersNotif" || item.id === "lowStockNotif" || item.id === "msgNotif") {
      settingsStore.updateNotifSetting(item.id, value === "Enabled");
    } else if (item.id === "upiEnabled" || item.id === "razorpayEnabled") {
      settingsStore.updatePaymentSetting(item.id, value === "Connected");
    } else if (item.id === "codEnabled") {
      settingsStore.updatePaymentSetting(item.id, value === "Enabled");
    }

    const newGroups = [...groups];
    newGroups[groupIdx].items[itemIdx].value = value;
    setGroups(newGroups);
    setEditingSetting(null);
    displayToast("Setting updated successfully");
  };

  const executeDeleteAll = async () => {
    setIsDeleteModalOpen(false);
    setDeleteStep(1);
    setDeleteConfirmation("");
    
    const token = await getToken();
    if (!token) return displayToast("Unauthorized");

    deleteAllProducts(); 
    deleteAllOrders(token);
    displayToast("All data have been deleted permanently");
  };

  return (
    <div className="p-4 md:p-8 max-w-[900px] pb-24 relative">
      <div className="pt-4 md:pt-0 mb-6 md:mb-8">
        <p className="text-[10px] font-mono text-[#bbb] uppercase tracking-[0.2em]">Admin</p>
        <h1 className="text-2xl md:text-3xl font-serif text-[#2C2C2C] mt-0.5 tracking-tight">Settings</h1>
        <p className="text-xs text-[#aaa] mt-1">Manage your store configuration and preferences</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#F0EDE8] overflow-hidden mb-5">
        <div className="px-5 py-3.5 border-b border-[#F0EDE8]">
          <h2 className="text-xs font-semibold text-[#2C2C2C] uppercase tracking-[0.1em]">Quick Settings</h2>
        </div>
        <div className="divide-y divide-[#F0EDE8]">
          {toggles.map((toggle) => {
            const Icon = toggle.icon;
            return (
              <div key={toggle.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#FAFAF8] transition-colors cursor-pointer" onClick={() => handleToggle(toggle.id)}>
                <div className="w-8 h-8 rounded-xl bg-[#F5B8C8]/15 flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-[#E8809A]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#2C2C2C]">{toggle.label}</p>
                  <p className="text-[10px] text-[#bbb]">{toggle.desc}</p>
                </div>
                <button
                  className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                    toggle.enabled ? "bg-[#E8809A]" : "bg-[#E0E0E0]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                      toggle.enabled ? "left-5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {groups.map((group, groupIdx) => {
        const GroupIcon = group.icon;
        return (
          <div key={group.title} className="bg-white rounded-2xl border border-[#F0EDE8] overflow-hidden mb-4">
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[#F0EDE8]">
              <GroupIcon size={14} className="text-[#E8809A]" />
              <h2 className="text-xs font-semibold text-[#2C2C2C] uppercase tracking-[0.1em]">{group.title}</h2>
            </div>
            <div className="divide-y divide-[#F0EDE8]">
              {group.items.map((item, itemIdx) => (
                <div 
                  key={item.id} 
                  onClick={() => openEditModal(groupIdx, itemIdx)}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#FAFAF8] transition-colors cursor-pointer group hover:bg-slate-50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#2C2C2C]">{item.label}</p>
                    <p className="text-[10px] text-[#bbb]">{item.desc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#555] font-medium bg-[#FAFAF8] border border-[#F0EDE8] px-2 py-1 rounded-md">
                      {item.prefix}{item.value}
                    </span>
                    <ChevronRight size={14} className="text-[#ddd] group-hover:text-[#aaa] transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="bg-red-50 rounded-2xl border border-red-100 overflow-hidden mt-6 mb-8">
        <div className="px-5 py-3.5 border-b border-red-100">
          <h2 className="text-xs font-semibold text-red-700 uppercase tracking-[0.1em]">Danger Zone</h2>
        </div>
        <div className="px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-red-700">Delete All Products</p>
            <p className="text-[10px] text-red-400">This action is permanent and cannot be undone. All data will be wiped.</p>
          </div>
          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="text-xs font-medium text-red-600 border border-red-200 bg-white px-4 py-2 rounded-xl hover:bg-red-600 hover:text-white transition-colors whitespace-nowrap"
          >
            Delete All Data
          </button>
        </div>
      </div>

      {/* MODALS */}
      {/* Edit Setting Modal */}
      {editingSetting && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setEditingSetting(null)} />
          <div className="relative bg-white w-full max-w-sm rounded-[24px] shadow-2xl p-6 animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-0 md:zoom-in-95 duration-200">
            <button
              onClick={() => setEditingSetting(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#FAFAF8] text-[#888] hover:bg-[#F0EDE8] hover:text-[#2C2C2C] transition-colors"
            >
              <X size={16} />
            </button>
            <h3 className="text-lg font-serif text-[#2C2C2C] mb-1">{editingSetting.item.label}</h3>
            <p className="text-xs text-[#888] mb-6">{editingSetting.item.desc}</p>
            
            <div className="mb-6">
              {editingSetting.item.type === "text" && (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full bg-[#FAFAF8] border border-[#F0EDE8] rounded-xl px-4 py-3 text-sm text-[#2C2C2C] placeholder-[#aaa] focus:outline-none focus:border-[#E8809A] transition-colors"
                  placeholder={`Enter ${editingSetting.item.label.toLowerCase()}`}
                  autoFocus
                />
              )}
              {editingSetting.item.type === "number" && (
                <div className="relative">
                  {editingSetting.item.prefix && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888] text-sm font-medium">
                      {editingSetting.item.prefix}
                    </span>
                  )}
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className={`w-full bg-[#FAFAF8] border border-[#F0EDE8] rounded-xl py-3 text-sm text-[#2C2C2C] placeholder-[#aaa] focus:outline-none focus:border-[#E8809A] transition-colors ${editingSetting.item.prefix ? 'pl-8 pr-4' : 'px-4'}`}
                    placeholder={`0`}
                    autoFocus
                  />
                </div>
              )}
              {editingSetting.item.type === "select" && editingSetting.item.options && (
                <div className="space-y-2">
                  {editingSetting.item.options.map((opt: string) => (
                    <button
                      key={opt}
                      onClick={() => setEditValue(opt)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                        editValue === opt 
                          ? "bg-[#F5B8C8]/10 border-[#E8809A] text-[#E8809A]" 
                          : "bg-[#FAFAF8] border-[#F0EDE8] text-[#2C2C2C] hover:border-[#ddd]"
                      }`}
                    >
                      <span className="text-sm font-medium">{opt}</span>
                      {editValue === opt && <Check size={16} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingSetting(null)}
                className="flex-1 px-4 py-3 rounded-xl bg-[#FAFAF8] text-[#888] text-sm font-medium hover:bg-[#F0EDE8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveSetting}
                disabled={!editValue.trim()}
                className="flex-[2] px-4 py-3 rounded-xl bg-[#2C2C2C] text-white text-sm font-medium hover:bg-black transition-colors disabled:opacity-50"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setIsDeleteModalOpen(false); setDeleteStep(1); setDeleteConfirmation(""); }} />
          <div className="relative bg-white w-full max-w-sm rounded-[24px] shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-5 mx-auto">
              <AlertTriangle size={24} />
            </div>
            
            <h3 className="text-lg font-serif text-[#2C2C2C] text-center mb-2">Delete All Products?</h3>
            
            {deleteStep === 1 ? (
              <>
                <p className="text-sm text-[#555] text-center mb-6">
                  This will permanently delete all your products, variations, and related media. This action <strong>cannot</strong> be undone.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setDeleteStep(2)}
                    className="w-full px-4 py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors"
                  >
                    Yes, I understand the risks
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAFAF8] text-[#2C2C2C] text-sm font-medium hover:bg-[#F0EDE8] transition-colors"
                  >
                    Cancel, keep my products
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-[#555] text-center mb-4">
                  To confirm, type <strong>DELETE</strong> below:
                </p>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="w-full bg-[#FAFAF8] border border-red-200 rounded-xl px-4 py-3 text-sm text-[#2C2C2C] text-center uppercase tracking-wider focus:outline-none focus:border-red-500 mb-6"
                  placeholder="DELETE"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => { setDeleteStep(1); setDeleteConfirmation(""); }}
                    className="flex-1 px-4 py-3 rounded-xl bg-[#FAFAF8] text-[#2C2C2C] text-sm font-medium hover:bg-[#F0EDE8] transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={executeDeleteAll}
                    disabled={deleteConfirmation !== "DELETE"}
                    className="flex-[2] px-4 py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:bg-red-300"
                  >
                    Confirm Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-[#2C2C2C] text-white px-5 py-3 rounded-full shadow-xl flex items-center gap-3">
            <Check size={16} className="text-[#E8809A]" />
            <span className="text-sm font-medium whitespace-nowrap">{toastMessage}</span>
          </div>
        </div>
      )}

    </div>
  );
}
