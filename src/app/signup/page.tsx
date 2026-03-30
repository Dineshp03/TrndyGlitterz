"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";

type Field =
  | "fullName"
  | "email"
  | "phone"
  | "password"
  | "confirmPassword"
  | "address"
  | "city"
  | "state"
  | "pincode";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

const empty: FormData = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

// ── Extracted outside the page component to avoid hook rules violations ──
interface InputFieldProps {
  label: string;
  field: Field;
  type?: string;
  placeholder?: string;
  half?: boolean;
  value: string;
  onChange: (field: Field, value: string) => void;
  error?: string;
  endSlot?: React.ReactNode;
}

function SignupInput({
  label,
  field,
  type = "text",
  placeholder,
  half = false,
  value,
  onChange,
  error,
  endSlot,
}: InputFieldProps) {
  return (
    <div className={half ? "col-span-1" : "col-span-2"}>
      <label className="text-[10px] font-sans uppercase tracking-[0.2em] text-obsidian/50 block mb-2">
        {label}
      </label>
      <div
        className={`border-b pb-2 transition-colors flex items-center gap-2 ${
          error ? "border-burgundy" : "border-obsidian/20 focus-within:border-obsidian"
        }`}
      >
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-obsidian text-sm font-sans font-light placeholder:text-obsidian/25 focus:outline-none"
        />
        {endSlot}
      </div>
      {error && (
        <p className="text-[10px] text-burgundy mt-1 font-sans">{error}</p>
      )}
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useUserStore();

  const [form, setForm] = useState<FormData>(empty);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const update = (field: Field, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const validate = () => {
    const e: Partial<Record<Field, string>> = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required.";
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email))
      e.email = "Valid email is required.";
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone))
      e.phone = "Enter a valid 10-digit phone number.";
    if (!form.password || form.password.length < 8)
      e.password = "Password must be at least 8 characters.";
    if (form.confirmPassword !== form.password)
      e.confirmPassword = "Passwords do not match.";
    if (!form.address.trim()) e.address = "Address is required.";
    if (!form.city.trim()) e.city = "City is required.";
    if (!form.state.trim()) e.state = "State is required.";
    if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode))
      e.pincode = "Enter a valid 6-digit pincode.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError("");
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const result = signup(
      {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
      },
      form.password
    );
    setLoading(false);
    if (result.success) {
      setSuccess(true);
      await new Promise((r) => setTimeout(r, 2000));
      router.push("/login");
    } else {
      setGlobalError(result.error || "Signup failed.");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-alabaster flex items-center justify-center px-8">
        <div className="text-center max-w-sm">
          <CheckCircle className="w-16 h-16 text-obsidian mx-auto mb-6" strokeWidth={1} />
          <h2 className="text-4xl font-serif text-obsidian tracking-tighter mb-4">
            Account Created!
          </h2>
          <p className="text-sm font-sans font-light text-obsidian/60">
            Redirecting you to sign in…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-alabaster flex relative">
      {/* Centered Top Branding */}
      <div className="absolute top-8 left-0 w-full z-50 flex justify-center pointer-events-none">
        <Link 
          href="/" 
          className="text-xl md:text-3xl font-serif tracking-[0.3em] pointer-events-auto text-obsidian lg:mix-blend-difference lg:text-white"
        >
          TRENDY GLITTERZ
        </Link>
      </div>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-obsidian flex-col justify-between p-16">
        <div className="noise-bg absolute inset-0 opacity-[0.05]" />
        {/* Branding placeholder */}
        <div className="relative z-10 opacity-0">
          <Link 
            href="/" 
            className="text-lg sm:text-2xl md:text-3xl font-serif tracking-[0.1em] text-alabaster"
          >
            TRENDY GLITTERZ
          </Link>
        </div>
        <div className="relative z-10">
          <p className="text-[10px] font-sans uppercase tracking-[0.4em] text-dustyrose mb-6">
            Join the Circle
          </p>
          <h2 className="text-5xl xl:text-6xl font-serif text-alabaster tracking-tighter leading-[0.9] mb-8">
            Become a<br />
            <span className="italic font-light opacity-70">Member.</span>
          </h2>
          <p className="text-sm font-sans font-light text-alabaster/50 max-w-xs leading-relaxed">
            Unlock exclusive access to member pricing, curated wishlists, and personal styling advice.
          </p>
        </div>
        <div className="relative z-10">
          <div className="pt-8 border-t border-alabaster/10">
            <p className="text-[10px] font-sans uppercase tracking-[0.3em] text-alabaster/30">
              SECURE · PRIVATE · EXCLUSIVE
            </p>
          </div>
        </div>
        <div className="absolute bottom-20 right-8 w-48 h-48 border border-dustyrose/10 rounded-full pointer-events-none" />
        <div className="absolute top-32 right-20 w-24 h-24 border border-dustyrose/10 rounded-full pointer-events-none" />
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-7/12 overflow-y-auto">
        <div className="max-w-xl mx-auto px-8 sm:px-12 py-16">
          <div className="flex flex-col gap-3 mt-24 mb-12">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[10px] font-sans uppercase tracking-[0.2em] text-obsidian/60 hover:text-obsidian transition-colors group z-20 relative"
            >
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
              Back to Store
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-[10px] font-sans uppercase tracking-[0.2em] text-obsidian/40 hover:text-obsidian transition-colors group z-20 relative ml-5"
            >
              Already have an account?
            </Link>
          </div>

          <div className="mb-10">
            <p className="text-[10px] font-sans uppercase tracking-[0.4em] text-dustyrose mb-4">
              Create Account
            </p>
            <h1 className="text-4xl sm:text-5xl font-serif text-obsidian tracking-tighter">
              Sign Up
            </h1>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-6 sm:gap-y-8">
              <SignupInput label="Full Name" field="fullName" placeholder="Jane Doe" value={form.fullName} onChange={update} error={errors.fullName} />
              <SignupInput label="Email Address" field="email" type="email" placeholder="your@email.com" value={form.email} onChange={update} error={errors.email} />
              <SignupInput label="Phone Number" field="phone" type="tel" placeholder="10-digit mobile number" value={form.phone} onChange={update} error={errors.phone} />
              <SignupInput
                label="Password"
                field="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={update}
                error={errors.password}
                endSlot={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-obsidian/30 hover:text-obsidian transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
              <SignupInput
                label="Confirm Password"
                field="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={update}
                error={errors.confirmPassword}
                endSlot={
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-obsidian/30 hover:text-obsidian transition-colors">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              {/* Delivery Address section header */}
              <div className="col-span-2 pt-4 border-t border-obsidian/10">
                <p className="text-[10px] font-sans uppercase tracking-[0.3em] text-obsidian/40 mb-1">
                  Delivery Address
                </p>
              </div>

              <SignupInput label="Street Address" field="address" placeholder="123, Brigade Road…" value={form.address} onChange={update} error={errors.address} />
              <SignupInput label="City" field="city" placeholder="Bengaluru" value={form.city} onChange={update} error={errors.city} half />
              <SignupInput label="State" field="state" placeholder="Karnataka" value={form.state} onChange={update} error={errors.state} half />
              <SignupInput label="Pincode" field="pincode" placeholder="560001" value={form.pincode} onChange={update} error={errors.pincode} half />
            </div>

            {globalError && (
              <p className="text-xs font-sans text-burgundy border-l-2 border-burgundy pl-3 mt-6">
                {globalError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-10 bg-dustyrose text-alabaster text-[11px] font-sans uppercase tracking-[0.2em] py-5 hover:bg-dustyrose/80 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account…" : "Create Account"}
            </button>

            <p className="text-center text-xs font-sans font-light text-obsidian/30 mt-6">
              By signing up you agree to our{" "}
              <span className="underline cursor-pointer">Terms of Service</span> and{" "}
              <span className="underline cursor-pointer">Privacy Policy</span>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
