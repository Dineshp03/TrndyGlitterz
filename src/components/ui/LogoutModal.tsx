"use client";

import { LogOut, AlertCircle, X } from "lucide-react";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function LogoutModal({ isOpen, onClose, onConfirm, isLoading }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div 
        className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl transform scale-100 opacity-100 transition-all border border-[#F0EDE8]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shadow-sm">
            <AlertCircle className="text-red-500 w-6 h-6" />
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <h3 className="text-2xl font-serif text-[#2C2C2C] mb-2 font-bold tracking-tight">Confirm Sign Out</h3>
        <p className="text-sm font-sans font-light text-[#555] mb-8 leading-relaxed">
          Are you sure you want to sign out of your account? You will need to log in again to access your profile and orders.
        </p>

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl border border-[#e5e5e5] text-[#555] text-xs font-semibold hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-all shadow-lg shadow-red-500/25 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
