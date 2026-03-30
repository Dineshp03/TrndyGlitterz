import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  category: string;
}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  address: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  avatar?: string;
  orders: Order[];
  joinedAt: string;
  role: "user" | "admin";
}

interface UserState {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  // Auth
  login: (email: string, password: string) => { success: boolean; error?: string };
  signup: (data: SignupData, password: string) => { success: boolean; error?: string };
  logout: () => void;
  // Profile
  updateProfile: (data: Partial<Omit<User, "id" | "orders" | "joinedAt">>) => void;
  changePassword: (oldPassword: string, newPassword: string) => { success: boolean; error?: string };
  addOrder: (order: Omit<Order, "id" | "date">) => void;
}

export interface SignupData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

// Simple in-memory "database": stored in localStorage via zustand persist
interface AccountsDB {
  [email: string]: { user: User; passwordHash: string };
}

// A very lightweight hash (not for real security — just demo)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      isAdmin: false,

      login: (email, password) => {
        // Special Admin Pass Check
        // ID: admin@trendy.com, Pass: TRENDY789
        if (email.toLowerCase() === "admin@trendy.com" && password === "TRENDY789") {
          const adminUser: User = {
            id: "admin-001",
            fullName: "Trendy Admin",
            email: "admin@trendy.com",
            phone: "+91 00000 00000",
            address: "Main Office",
            city: "Mumbai",
            state: "MH",
            pincode: "400001",
            orders: [],
            joinedAt: new Date().toISOString(),
            role: "admin"
          };
          set({ user: adminUser, isLoggedIn: true, isAdmin: true });
          return { success: true };
        }

        const raw = localStorage.getItem("trendy-accounts");
        const accounts: AccountsDB = raw ? JSON.parse(raw) : {};
        const record = accounts[email.toLowerCase()];
        if (!record) return { success: false, error: "No account found with this email." };
        if (record.passwordHash !== simpleHash(password))
          return { success: false, error: "Incorrect password. Please try again." };
        set({ user: record.user, isLoggedIn: true });
        return { success: true };
      },

      signup: (data, password) => {
        const raw = localStorage.getItem("trendy-accounts");
        const accounts: AccountsDB = raw ? JSON.parse(raw) : {};
        const key = data.email.toLowerCase();
        if (accounts[key]) return { success: false, error: "An account with this email already exists." };
        const newUser: User = {
          id: `user-${Date.now()}`,
          ...data,
          orders: [],
          joinedAt: new Date().toISOString(),
          role: "user"
        };
        accounts[key] = { user: newUser, passwordHash: simpleHash(password) };
        localStorage.setItem("trendy-accounts", JSON.stringify(accounts));
        return { success: true };
      },

      logout: () => set({ user: null, isLoggedIn: false, isAdmin: false }),

      updateProfile: (data) => {
        set((state) => {
          if (!state.user) return {};
          const updatedUser = { ...state.user, ...data };
          // Sync to accounts db
          const raw = localStorage.getItem("trendy-accounts");
          const accounts: AccountsDB = raw ? JSON.parse(raw) : {};
          const key = updatedUser.email.toLowerCase();
          if (accounts[key]) {
            accounts[key].user = updatedUser;
            localStorage.setItem("trendy-accounts", JSON.stringify(accounts));
          }
          return { user: updatedUser };
        });
      },

      changePassword: (oldPassword, newPassword) => {
        const state = get();
        if (!state.user) return { success: false, error: "Not logged in." };
        const raw = localStorage.getItem("trendy-accounts");
        const accounts: AccountsDB = raw ? JSON.parse(raw) : {};
        const key = state.user.email.toLowerCase();
        if (!accounts[key]) return { success: false, error: "Account not found." };
        if (accounts[key].passwordHash !== simpleHash(oldPassword))
          return { success: false, error: "Current password is incorrect." };
        accounts[key].passwordHash = simpleHash(newPassword);
        localStorage.setItem("trendy-accounts", JSON.stringify(accounts));
        return { success: true };
      },

      addOrder: (orderData) => {
        set((state) => {
          if (!state.user) return {};
          const order: Order = {
            id: `ORD-${Date.now()}`,
            date: new Date().toISOString(),
            ...orderData,
          };
          const updatedUser = { ...state.user, orders: [order, ...state.user.orders] };
          const raw = localStorage.getItem("trendy-accounts");
          const accounts: AccountsDB = raw ? JSON.parse(raw) : {};
          const key = updatedUser.email.toLowerCase();
          if (accounts[key]) {
            accounts[key].user = updatedUser;
            localStorage.setItem("trendy-accounts", JSON.stringify(accounts));
          }
          return { user: updatedUser };
        });
      },
    }),
    {
      name: "trendy-user-session",
      partialize: (state) => ({ user: state.user, isLoggedIn: state.isLoggedIn, isAdmin: state.isAdmin }),
    }
  )
);
