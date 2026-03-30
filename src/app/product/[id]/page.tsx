"use client";

import Image from "next/image";
import { useParams, notFound } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { useProductStore } from "@/store/useProductStore";
import ProductCard from "@/components/ProductCard";
import MobileProductGallery from "@/components/MobileProductGallery";
import { useCartStore } from "@/store/useCartStore";
import { useOrderStore } from "@/store/useOrderStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { CheckCircle, X, ChevronRight, ChevronLeft, Loader2, ShoppingBag, CreditCard } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  MagneticButton — cursor-tracking magnetic CTA button               */
/* ------------------------------------------------------------------ */
function MagneticButton({
  children,
  onClick,
  disabled,
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = ref.current!.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.35;
    const dy = (e.clientY - cy) * 0.35;
    setPos({ x: dx, y: dy });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setPos({ x: 0, y: 0 });
    setHovered(false);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = ref.current!.getBoundingClientRect();
    const id = Date.now();
    setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 700);
    onClick?.();
  }, [onClick]);

  const base =
    variant === "primary"
      ? "bg-dustyrose text-alabaster"
      : "bg-obsidian text-alabaster";

  return (
    <button
      ref={ref}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px) scale(${hovered ? 1.04 : 1})`,
        transition: hovered
          ? "transform 0.15s cubic-bezier(0.25,1,0.5,1)"
          : "transform 0.5s cubic-bezier(0.25,1,0.5,1)",
      }}
      className={`relative overflow-hidden w-full flex items-center justify-center gap-2.5 text-[11px] font-sans uppercase tracking-[0.18em] py-4 rounded-xl shadow-sm disabled:opacity-40 disabled:cursor-not-allowed ${base} ${className}`}
    >
      {/* Shimmer sweep on hover */}
      <span
        className="pointer-events-none absolute inset-0 -translate-x-full"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)",
          transition: hovered ? "transform 0.55s ease" : "none",
          transform: hovered ? "translateX(200%)" : "translateX(-100%)",
        }}
      />
      {/* Ripples */}
      {ripples.map(({ id, x, y }) => (
        <span
          key={id}
          className="pointer-events-none absolute rounded-full bg-white/25 animate-ping"
          style={{
            left: x - 20,
            top: y - 20,
            width: 40,
            height: 40,
            animationDuration: "0.65s",
            animationIterationCount: 1,
          }}
        />
      ))}
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
type Step = "details" | "payment" | "success";

interface UserDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface PaymentDetails {
  method: "cod" | "upi" | "razorpay";
  upiId: string;
}

const emptyDetails: UserDetails = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

/* ================================================================== */
/*  Payment Modal                                                       */
/* ================================================================== */
function PaymentModal({
  product,
  onClose,
}: {
  product: { name: string; price: number; image: string };
  onClose: () => void;
}) {
  const { addOrder } = useOrderStore();
  const { codEnabled, upiEnabled } = useSettingsStore();

  const [step, setStep] = useState<Step>("details");
  const [details, setDetails] = useState<UserDetails>(emptyDetails);
  
  const defaultMethod = codEnabled ? "cod" : upiEnabled ? "upi" : "razorpay";
  
  const [payment, setPayment] = useState<PaymentDetails>({
    method: defaultMethod,
    upiId: "",
  });
  const [errors, setErrors] = useState<Partial<UserDetails & { upiId: string }>>({});
  const [processing, setProcessing] = useState(false);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  /* ---------- validation ---------- */
  const validateDetails = () => {
    const e: Partial<UserDetails> = {};
    if (!details.fullName.trim()) e.fullName = "Full name is required";
    if (!details.email.trim() || !/^\S+@\S+\.\S+$/.test(details.email))
      e.email = "Valid email is required";
    if (!details.phone.trim() || !/^\d{10}$/.test(details.phone))
      e.phone = "Enter a valid 10-digit phone number";
    if (!details.address.trim()) e.address = "Address is required";
    if (!details.city.trim()) e.city = "City is required";
    if (!details.state.trim()) e.state = "State is required";
    if (!details.pincode.trim() || !/^\d{6}$/.test(details.pincode))
      e.pincode = "Enter a valid 6-digit pincode";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePayment = () => {
    if (payment.method === "upi") {
      if (!payment.upiId.trim() || !/^[\w.\-_]{1,99}@[a-zA-Z]{3,}$/.test(payment.upiId)) {
        setErrors({ upiId: "Enter a valid UPI ID (e.g. name@upi)" });
        return false;
      }
    }
    setErrors({});
    return true;
  };

  /* ---------- handlers ---------- */
  const handleDetailsNext = () => {
    if (validateDetails()) setStep("payment");
  };

  const handlePayNow = () => {
    if (!validatePayment()) return;
    setProcessing(true);
    setTimeout(() => {
      // Add each item as an order
      const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      addOrder({
        id: `#ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        customer: details.fullName,
        product: product.name,
        amount: `₹${product.price.toFixed(2)}`,
        status: "pending",
        date: dateStr,
        qty: 1
      });

      setProcessing(false);
      setStep("success");
    }, 2000);
  };

  const field = (
    id: keyof UserDetails,
    label: string,
    type = "text",
    placeholder = ""
  ) => (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-[10px] font-sans uppercase tracking-[0.15em] text-obsidian/60"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={details[id]}
        onChange={(e) => {
          setDetails((d) => ({ ...d, [id]: e.target.value }));
          setErrors((er) => ({ ...er, [id]: undefined }));
        }}
        className={`border-b py-2 bg-transparent text-sm font-sans text-obsidian outline-none transition-colors duration-200 placeholder:text-obsidian/30 ${
          errors[id]
            ? "border-red-400"
            : "border-obsidian/20 focus:border-obsidian"
        }`}
      />
      {errors[id] && (
        <p className="text-[10px] text-red-500 mt-0.5">{errors[id]}</p>
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-obsidian/60 backdrop-blur-sm" />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg bg-alabaster shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 border-b border-obsidian/10">
          <div>
            <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-dustyrose">
              {step === "details"
                ? "Step 1 of 2 — Delivery Details"
                : step === "payment"
                ? "Step 2 of 2 — Payment"
                : "Order Confirmed"}
            </p>
            <p className="font-serif text-obsidian text-lg mt-0.5">{product.name}</p>
          </div>
          {step !== "success" && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-obsidian/40 hover:text-obsidian hover:bg-obsidian/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Progress bar */}
        {step !== "success" && (
          <div className="h-0.5 bg-obsidian/10">
            <div
              className="h-full bg-burgundy transition-all duration-500"
              style={{ width: step === "details" ? "50%" : "100%" }}
            />
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-4 sm:px-8 py-6 sm:py-8" style={{ overscrollBehavior: "contain" }}>

          {/* ---- Step 1: User Details ---- */}
          {step === "details" && (
            <div className="flex flex-col gap-5">
              {/* Order summary mini */}
              <div className="flex gap-4 items-center p-4 bg-sand/30 border border-obsidian/10 mb-2">
                <div className="relative w-14 aspect-[3/4] flex-shrink-0 overflow-hidden">
                  <Image src={product.image} alt={product.name} fill className="object-cover" />
                </div>
                <div>
                  <p className="text-sm font-serif text-obsidian">{product.name}</p>
                  <p className="text-xs font-sans font-medium text-obsidian mt-1">
                    ₹{product.price.toFixed(2)}
                  </p>
                </div>
              </div>

              {field("fullName", "Full Name", "text", "Jane Austen")}
              {field("email", "Email Address", "email", "jane@example.com")}
              {field("phone", "Phone Number", "tel", "9876543210")}
              {field("address", "Street Address", "text", "123, Rose Lane")}

              <div className="grid grid-cols-2 gap-4">
                {field("city", "City")}
                {field("state", "State")}
              </div>
              {field("pincode", "Pincode", "text", "400001")}
            </div>
          )}

          {/* ---- Step 2: Payment ---- */}
          {step === "payment" && (
            <div className="flex flex-col gap-6">
              <p className="text-[10px] font-sans uppercase tracking-[0.15em] text-obsidian/60 mb-2">
                Choose Payment Method
              </p>

              {/* COD */}
              {codEnabled && (
                <label
                  className={`flex items-start gap-4 p-5 border cursor-pointer transition-colors duration-200 ${
                    payment.method === "cod"
                      ? "border-burgundy bg-burgundy/5"
                      : "border-obsidian/15 hover:border-obsidian/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={payment.method === "cod"}
                    onChange={() => {
                      setPayment({ method: "cod", upiId: "" });
                      setErrors({});
                    }}
                    className="mt-1 accent-burgundy"
                  />
                  <div>
                    <p className="text-sm font-serif text-obsidian">Cash on Delivery</p>
                    <p className="text-[11px] font-sans text-obsidian/50 mt-1 leading-relaxed">
                      Pay in cash when your order arrives at your doorstep. No
                      online transaction required.
                    </p>
                  </div>
                </label>
              )}

              {/* UPI */}
              {upiEnabled && (
              <label
                className={`flex items-start gap-4 p-5 border cursor-pointer transition-colors duration-200 ${
                  payment.method === "upi"
                    ? "border-burgundy bg-burgundy/5"
                    : "border-obsidian/15 hover:border-obsidian/40"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={payment.method === "upi"}
                  onChange={() => setPayment((p) => ({ ...p, method: "upi" }))}
                  className="mt-1 accent-burgundy"
                />
                <div className="w-full">
                  <p className="text-sm font-serif text-obsidian">UPI Payment</p>
                  <p className="text-[11px] font-sans text-obsidian/50 mt-1 leading-relaxed">
                    Pay instantly using any UPI app like GPay, PhonePe, or Paytm.
                  </p>
                  {payment.method === "upi" && (
                    <div className="mt-4 flex flex-col gap-1">
                      <label className="text-[10px] font-sans uppercase tracking-[0.15em] text-obsidian/60">
                        UPI ID
                      </label>
                      <input
                        type="text"
                        placeholder="yourname@upi"
                        value={payment.upiId}
                        onChange={(e) => {
                          setPayment((p) => ({ ...p, upiId: e.target.value }));
                          setErrors((er) => ({ ...er, upiId: undefined }));
                        }}
                        className={`border-b py-2 bg-transparent text-sm font-sans text-obsidian outline-none placeholder:text-obsidian/30 transition-colors ${
                          errors.upiId ? "border-red-400" : "border-obsidian/30 focus:border-obsidian"
                        }`}
                      />
                      {errors.upiId && (
                        <p className="text-[10px] text-red-500">{errors.upiId}</p>
                      )}
                    </div>
                  )}
                </div>
              </label>
              )}

              {/* Order summary */}
              <div className="mt-2 border-t border-obsidian/10 pt-4 flex flex-col gap-2 text-xs font-sans text-obsidian/70">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{product.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between font-medium text-obsidian text-sm mt-2 pt-2 border-t border-obsidian/10">
                  <span>Total</span>
                  <span>₹{product.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* ---- Step 3: Success ---- */}
          {step === "success" && (
            <div className="flex flex-col items-center text-center py-8 gap-6">
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center animate-bounce-once">
                <CheckCircle className="w-10 h-10 text-green-500" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-serif text-3xl text-obsidian mb-3">
                  Order Placed!
                </h3>
                <p className="text-sm font-sans font-light text-obsidian/60 leading-relaxed max-w-xs">
                  Thank you, <span className="font-medium text-obsidian">{details.fullName}</span>. Your order for{" "}
                  <span className="italic">{product.name}</span> has been confirmed and will be delivered to{" "}
                  <span className="font-medium text-obsidian">{details.city}</span>.
                </p>
              </div>
              <div className="w-full border border-obsidian/10 p-4 text-left flex flex-col gap-2 text-xs font-sans text-obsidian/60">
                <div className="flex justify-between">
                  <span>Payment Method</span>
                  <span className="uppercase font-medium text-obsidian">
                    {payment.method === "cod" ? "Cash on Delivery" : `UPI — ${payment.upiId}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery to</span>
                  <span className="font-medium text-obsidian">{details.pincode}, {details.state}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount</span>
                  <span className="font-medium text-obsidian">₹{product.price.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-dustyrose text-alabaster text-[11px] font-sans uppercase tracking-[0.15em] py-4 hover:bg-burgundy transition-colors duration-300 mt-2"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        {step !== "success" && (
          <div className="px-4 sm:px-8 py-4 sm:py-6 border-t border-obsidian/10 bg-alabaster">
            <button
              onClick={step === "details" ? handleDetailsNext : handlePayNow}
              disabled={processing}
              className="w-full flex items-center justify-center gap-3 bg-dustyrose text-alabaster text-[11px] font-sans uppercase tracking-[0.15em] py-4 hover:bg-burgundy disabled:opacity-60 transition-colors duration-300"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing…
                </>
              ) : step === "details" ? (
                <>
                  Continue to Payment
                  <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  {payment.method === "cod" ? "Place Order" : "Pay Now"}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
            {step === "payment" && (
              <button
                onClick={() => setStep("details")}
                className="w-full mt-3 text-[10px] font-sans uppercase tracking-[0.15em] text-obsidian/40 hover:text-obsidian transition-colors"
              >
                ← Back to Details
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Product Detail Page                                                 */
/* ================================================================== */
export default function ProductDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const { addItem } = useCartStore();
  const [showPayment, setShowPayment] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { 
    requestAnimationFrame(() => setMounted(true)); 
    window.scrollTo(0, 0);
  }, [id]);

  const { products } = useProductStore();
  const product = products.find((p) => p.id === id);
  const allImages = product?.images && product.images.length > 0
    ? product.images
    : product ? [product.image] : [];

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  if (!product) return notFound();

  const suggestedItems = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  );

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-alabaster pt-32 pb-24">
      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal product={product} onClose={() => setShowPayment(false)} />
      )}

      <div className="container mx-auto px-6 md:px-12">
        {/* Product Details Section */}
        <div className="flex flex-col md:flex-row gap-12 lg:gap-24 mb-32">
          {/* Image Gallery */}
          <div className="px-0 md:px-0 w-full md:w-1/2 lg:w-5/12 flex justify-center">
            <div className="flex flex-col gap-4 w-full md:max-w-[450px]">
              
              {/* Desktop Main image & Thumbnails (Hidden on Mobile) */}
              <div className="hidden md:flex flex-col gap-4">
                <div className="relative aspect-[3/4] bg-sand/30 overflow-hidden rounded-3xl shadow-sm group md:max-h-[65vh] animate-glow-pink">
                  <Image
                    src={allImages[selectedImageIdx]}
                    alt={product.name}
                    fill
                    className="object-cover object-center transition-all duration-500"
                    priority
                    quality={90}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {/* Prev/Next arrows */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedImageIdx((i) => (i === 0 ? allImages.length - 1 : i - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-4 h-4 text-obsidian" />
                      </button>
                      <button
                        onClick={() => setSelectedImageIdx((i) => (i === allImages.length - 1 ? 0 : i + 1))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-4 h-4 text-obsidian" />
                      </button>
                      {/* Dot indicators */}
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                        {allImages.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setSelectedImageIdx(i)}
                            className={`rounded-full transition-all duration-300 ${
                              i === selectedImageIdx
                                ? "w-4 h-1.5 bg-white"
                                : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                            }`}
                            aria-label={`View image ${i + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                {/* Thumbnail strip */}
                {allImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1">
                    {allImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImageIdx(i)}
                        className={`relative flex-shrink-0 w-16 h-20 rounded-xl overflow-hidden transition-all duration-200 ${
                          i === selectedImageIdx
                            ? "ring-2 ring-obsidian ring-offset-1"
                            : "opacity-50 hover:opacity-80"
                        }`}
                        aria-label={`Thumbnail ${i + 1}`}
                      >
                        <Image src={img} alt={`${product.name} view ${i + 1}`} fill className="object-cover object-center" sizes="64px" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile 3D Image Gallery (Hidden on Desktop) */}
              <div className="block md:hidden -mx-6">
                <MobileProductGallery product={{...product, images: allImages}} />
              </div>

            </div>
          </div>

          {/* Details */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <p className="text-[10px] font-sans uppercase tracking-[0.3em] text-dustyrose mb-6">
              {product.category}
            </p>
            <h1 className="text-4xl md:text-6xl font-serif text-obsidian tracking-tight mb-8">
              {product.name}
            </h1>
            <p className="text-2xl font-sans font-medium text-obsidian tabular-nums mb-12">
              ₹{product.price.toFixed(2)}
            </p>

            <div className="mb-12">
              <p className="text-sm font-sans font-light text-obsidian/70 leading-relaxed max-w-lg whitespace-pre-line">
                {product.description || "A curated study in contemporary elegance. Discover pieces that blur the line between fashion and fine art. This piece is meticulously crafted to be an architectural extension of your personal identity."}
              </p>
              
              {product.stock !== undefined && (
                <div className="mt-6 flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <span className={`text-[10px] font-sans uppercase tracking-widest ${product.stock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? `In Stock (${product.stock} units)` : "Currently Unavailable"}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <MagneticButton
                variant="primary"
                disabled={!product.stock || product.stock <= 0}
                onClick={() => product.stock && product.stock > 0 && addItem(product)}
                className="sm:w-1/2"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                {product.stock && product.stock > 0 ? "Add to Cart" : "Out of Stock"}
              </MagneticButton>
              <MagneticButton
                variant="secondary"
                disabled={!product.stock || product.stock <= 0}
                onClick={() => product.stock && product.stock > 0 && setShowPayment(true)}
                className="sm:w-1/2"
              >
                <CreditCard className="w-3.5 h-3.5" />
                {product.stock && product.stock > 0 ? "Buy Now" : "Unavailable"}
              </MagneticButton>
            </div>

            <div className="mt-16 pt-8 border-t border-obsidian/10 flex flex-col gap-4 text-xs font-sans font-light text-obsidian/60 uppercase tracking-widest">
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Complimentary over ₹150</span>
              </div>
              <div className="flex justify-between">
                <span>Returns</span>
                <span>Within 14 Days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Suggested Items (Hidden on Mobile) */}
        {suggestedItems.length > 0 && (
          <div className="hidden md:block border-t border-obsidian/10 pt-24">
            <h2 className="text-3xl md:text-5xl font-serif tracking-tighter text-obsidian mb-16 text-center">
              Curated for You
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
              {suggestedItems.slice(0, 4).map((item, index) => (
                <div
                  key={item.id}
                  className="animate-reveal"
                  style={{ animationDelay: `${(index % 4) * 150}ms` }}
                >
                  <ProductCard product={item} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
