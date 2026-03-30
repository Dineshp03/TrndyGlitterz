"use client";

import { useState, useMemo } from "react";
import { Search, Mail, Phone, MapPin, X, UserX, MessageSquare } from "lucide-react";

// Initial mock data
const initialCustomers = [
  { id: "C001", name: "Priya Sharma", email: "priya@example.com", phone: "+91 98765 43210", location: "Mumbai", orders: 8, spent: "₹14,200", joined: "Jan 2026", avatar: "P" },
  { id: "C002", name: "Ananya Reddy", email: "ananya@example.com", phone: "+91 87654 32109", location: "Bangalore", orders: 5, spent: "₹9,450", joined: "Feb 2026", avatar: "A" },
  { id: "C003", name: "Meera Nair", email: "meera@example.com", phone: "+91 76543 21098", location: "Chennai", orders: 3, spent: "₹6,100", joined: "Feb 2026", avatar: "M" },
  { id: "C004", name: "Divya Kapoor", email: "divya@example.com", phone: "+91 65432 10987", location: "Delhi", orders: 12, spent: "₹22,800", joined: "Dec 2025", avatar: "D" },
  { id: "C005", name: "Riya Patel", email: "riya@example.com", phone: "+91 54321 09876", location: "Ahmedabad", orders: 2, spent: "₹4,200", joined: "Mar 2026", avatar: "R" },
  { id: "C006", name: "Kavya Singh", email: "kavya@example.com", phone: "+91 43210 98765", location: "Pune", orders: 7, spent: "₹12,700", joined: "Jan 2026", avatar: "K" },
];

const avatarColors = [
  "from-[#F5B8C8] to-[#E8809A]",
  "from-[#b8d4f5] to-[#809ae8]",
  "from-[#f5e4b8] to-[#e8c880]",
  "from-[#b8f5d4] to-[#80e8a9]",
  "from-[#f5c4b8] to-[#e8a080]",
  "from-[#d4b8f5] to-[#a080e8]",
];

type Customer = typeof initialCustomers[0];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
    );
  }, [customers, search]);

  const handleBlockCustomer = () => {
    if (selectedCustomer) {
      if(confirm(`Are you sure you want to block ${selectedCustomer.name}? this action is permanent.`)){
         setCustomers(customers.filter(c => c.id !== selectedCustomer.id));
         setSelectedCustomer(null);
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 pt-4 md:pt-0">
        <div>
          <p className="text-[10px] font-mono text-[#bbb] uppercase tracking-[0.2em]">Admin</p>
          <h1 className="text-2xl md:text-3xl font-serif text-[#2C2C2C] mt-0.5 tracking-tight">Customers</h1>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ccc]" />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#F0EDE8] rounded-full pl-8 pr-4 py-2 text-xs text-[#555] placeholder-[#ccc] focus:outline-none focus:border-[#F5B8C8] transition-all"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total Customers", value: customers.length.toString() },
          { label: "New This Month", value: "64" },
          { label: "Avg. Order Value", value: "₹2,280" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-[#F0EDE8] p-3 md:p-4 text-center">
            <p className="text-xl md:text-2xl font-bold text-[#2C2C2C]">{stat.value}</p>
            <p className="text-[9px] text-[#bbb] uppercase tracking-widest mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl border border-[#F0EDE8] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#F0EDE8]">
              {["Customer", "Contact", "Location", "Orders", "Total Spent", "Joined"].map((h) => (
                <th key={h} className="text-left text-[9px] font-mono text-[#bbb] uppercase tracking-[0.15em] px-5 py-3.5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length > 0 ? filteredCustomers.map((customer, i) => (
              <tr key={customer.id} onClick={() => setSelectedCustomer(customer)} className="border-b border-[#F0EDE8]/60 hover:bg-[#FAFAF8] transition-colors cursor-pointer">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                      {customer.avatar}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#2C2C2C]">{customer.name}</p>
                      <p className="text-[9px] font-mono text-[#bbb]">{customer.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-1 text-[10px] text-[#888]"><Mail size={10} className="text-[#ccc]" />{customer.email}</span>
                    <span className="flex items-center gap-1 text-[10px] text-[#888]"><Phone size={10} className="text-[#ccc]" />{customer.phone}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="flex items-center gap-1 text-xs text-[#888]">
                    <MapPin size={11} className="text-[#ccc]" />
                    {customer.location}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs font-medium text-[#555]">{customer.orders}</td>
                <td className="px-5 py-3.5 text-xs font-bold text-[#2C2C2C]">{customer.spent}</td>
                <td className="px-5 py-3.5 text-[10px] text-[#bbb]">{customer.joined}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-xs text-[#888]">No customers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredCustomers.length > 0 ? filteredCustomers.map((customer, i) => (
          <div key={customer.id} onClick={() => setSelectedCustomer(customer)} className="bg-white rounded-2xl border border-[#F0EDE8] p-4 cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white font-bold`}>
                {customer.avatar}
              </div>
              <div>
                <p className="text-sm font-medium text-[#2C2C2C]">{customer.name}</p>
                <p className="text-[10px] text-[#bbb]">{customer.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#F0EDE8]">
              <div className="text-center">
                <p className="text-sm font-bold text-[#2C2C2C]">{customer.orders}</p>
                <p className="text-[9px] text-[#bbb] uppercase tracking-widest">Orders</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-[#2C2C2C]">{customer.spent}</p>
                <p className="text-[9px] text-[#bbb] uppercase tracking-widest">Spent</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-medium text-[#888]">{customer.location}</p>
                <p className="text-[9px] text-[#bbb] uppercase tracking-widest">City</p>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-8 text-xs text-[#888]">No customers found.</div>
        )}
      </div>

      {/* Modal for Customer Details */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-obsidian/40 backdrop-blur-sm" onClick={() => setSelectedCustomer(null)}>
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center justify-center pt-8 pb-6 px-6 relative border-b border-[#F0EDE8]">
              <button onClick={() => setSelectedCustomer(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 text-[#888]">
                <X size={16} />
              </button>
              <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-[#F5B8C8] to-[#E8809A] flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-sm`}>
                {selectedCustomer.avatar}
              </div>
              <h2 className="text-xl font-serif text-[#2C2C2C] mb-1">{selectedCustomer.name}</h2>
              <p className="text-[10px] font-mono text-[#E8809A] uppercase tracking-widest">{selectedCustomer.id} · Joined {selectedCustomer.joined}</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-[10px] font-mono text-[#bbb] uppercase tracking-widest mb-1"><Mail size={10} className="inline mr-1" />Email</p>
                  <p className="text-sm font-medium text-[#2C2C2C] truncate">{selectedCustomer.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-[#bbb] uppercase tracking-widest mb-1"><Phone size={10} className="inline mr-1" />Phone</p>
                  <p className="text-sm font-medium text-[#2C2C2C]">{selectedCustomer.phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-mono text-[#bbb] uppercase tracking-widest mb-1"><MapPin size={10} className="inline mr-1" />Location</p>
                  <p className="text-sm font-medium text-[#2C2C2C]">{selectedCustomer.location}</p>
                </div>
              </div>

              <div className="bg-[#FAFAF8] rounded-xl p-4 border border-[#F0EDE8] grid grid-cols-2 gap-4">
                <div className="text-center border-r border-[#F0EDE8]">
                  <p className="text-xl font-bold text-[#2C2C2C]">{selectedCustomer.orders}</p>
                  <p className="text-[9px] font-mono text-[#888] uppercase tracking-widest mt-1">Total Orders</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-[#2C2C2C]">{selectedCustomer.spent}</p>
                  <p className="text-[9px] font-mono text-[#888] uppercase tracking-widest mt-1">Total Spent</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#F0EDE8] flex flex-col sm:flex-row justify-end gap-3 bg-[#FAFAF8]">
              <button 
                onClick={handleBlockCustomer}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-full hover:bg-red-50 text-xs font-bold transition-colors w-full sm:w-auto"
              >
                <UserX size={14} /> Block
              </button>
              <button 
                onClick={() => { alert(`Emailing ${selectedCustomer.email}...`); setSelectedCustomer(null); }}
                className="flex items-center justify-center gap-2 px-5 py-2 bg-[#2C2C2C] text-white text-xs font-bold uppercase tracking-[0.1em] rounded-full hover:bg-black transition-colors shadow-sm w-full sm:w-auto"
              >
                <MessageSquare size={14} /> Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
