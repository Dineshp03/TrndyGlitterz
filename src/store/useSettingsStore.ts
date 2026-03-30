import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  shippingDetails: string;
  updateShippingDetails: (details: string) => void;
  // Payments
  upiEnabled: boolean;
  razorpayEnabled: boolean;
  codEnabled: boolean;
  updatePaymentSetting: (key: 'upiEnabled' | 'razorpayEnabled' | 'codEnabled', value: boolean) => void;
  // Notifications
  newOrdersNotif: boolean;
  lowStockNotif: boolean;
  msgNotif: boolean;
  updateNotifSetting: (key: 'newOrdersNotif' | 'lowStockNotif' | 'msgNotif', value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      shippingDetails: "Free shipping on orders above ₹999",
      updateShippingDetails: (details) => set({ shippingDetails: details }),
      upiEnabled: true,
      razorpayEnabled: true,
      codEnabled: true,
      updatePaymentSetting: (key, value) => set({ [key]: value }),
      newOrdersNotif: true,
      lowStockNotif: true,
      msgNotif: false,
      updateNotifSetting: (key, value) => set({ [key]: value }),
    }),
    {
      name: "trendy-settings",
    }
  )
);
