"use client";

import Image from "next/image";
import { useParams, notFound, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect, useRef, useCallback } from "react";
import { useProductStore } from "@/store/useProductStore";
import ProductCard from "@/components/ProductCard";
import MobileProductGallery from "@/components/MobileProductGallery";
import { useCart } from "@/hooks/useCart";
import { useOrderStore } from "@/store/useOrderStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { CheckCircle, X, ChevronRight, ChevronLeft, Loader2, ShoppingBag, CreditCard, ShieldCheck, RotateCcw, Ban, Truck, Sparkles, Smile, Shield } from "lucide-react";

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
    if (!ref.current || window.matchMedia("(pointer: coarse)").matches) return;
    const rect = ref.current.getBoundingClientRect();
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
    if (!ref.current) return;
    
    // Only show ripples for fine pointers (mouse) to keep mobile snappy
    if (!window.matchMedia("(pointer: coarse)").matches) {
      const rect = ref.current.getBoundingClientRect();
      const id = Date.now();
      setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
      setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 700);
    }
    
    onClick?.();
  }, [onClick]);

  const base =
    variant === "primary"
      ? "bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-[#111] font-bold shadow-[0_4px_15px_rgba(212,175,55,0.3)]"
      : "bg-obsidian text-alabaster border border-obsidian/10";

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
      <span
        className="pointer-events-none absolute inset-0 -translate-x-full"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)",
          transition: hovered ? "transform 0.55s ease" : "none",
          transform: hovered ? "translateX(200%)" : "translateX(-100%)",
        }}
      />
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
  fullName: string; email: string; phone: string; address: string; city: string; state: string; pincode: string;
}

interface PaymentDetails {
  method: "cod" | "upi" | "razorpay"; upiId: string;
}

const emptyDetails: UserDetails = {
  fullName: "", email: "", phone: "", address: "", city: "", state: "", pincode: "",
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
  const { placeOrder } = useOrderStore();
  const { codEnabled, upiEnabled } = useSettingsStore();
  const [step, setStep] = useState<Step>("details");
  const [details, setDetails] = useState<UserDetails>(emptyDetails);
  const defaultMethod = codEnabled ? "cod" : upiEnabled ? "upi" : "razorpay";
  const [payment, setPayment] = useState<PaymentDetails>({ method: defaultMethod, upiId: "" });
  const [errors, setErrors] = useState<Partial<UserDetails & { upiId: string }>>({});
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const validateDetails = () => {
    const e: Partial<UserDetails> = {};
    if (!details.fullName.trim()) e.fullName = "Name required";
    if (!details.email.trim() || !/^\S+@\S+\.\S+$/.test(details.email)) e.email = "Valid email required";
    if (!details.phone.trim() || !/^\d{10}$/.test(details.phone)) e.phone = "10-digit phone required";
    if (!details.address.trim()) e.address = "Address required";
    if (!details.city.trim()) e.city = "City required";
    if (!details.state.trim()) e.state = "State required";
    if (!details.pincode.trim() || !/^\d{6}$/.test(details.pincode)) e.pincode = "6-digit pincode required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePayNow = () => {
    if (payment.method === "upi" && (!payment.upiId.trim() || !/^[\w.\-_]{1,99}@[a-zA-Z]{3,}$/.test(payment.upiId))) {
      setErrors({ upiId: "Valid UPI ID required" }); return;
    }
    setProcessing(true);
    setTimeout(() => {
      placeOrder({
        customer_name: details.fullName,
        customer_email: details.email,
        customer_phone: details.phone,
        address: details.address,
        city: details.city,
        state: details.state,
        pincode: details.pincode,
        total: product.price,
        items: [{
          product_name: product.name,
          product_image: product.image,
          price: product.price,
          quantity: 1
        }]
      });
      setProcessing(false); setStep("success");
    }, 2000);
  };

  const field = (id: keyof UserDetails, label: string) => (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-sans uppercase tracking-widest text-obsidian/60">{label}</label>
      <input
        value={details[id]}
        onChange={(e) => setDetails((d) => ({ ...d, [id]: e.target.value }))}
        className={`border-b pb-1 bg-transparent text-sm font-sans outline-none ${errors[id] ? "border-red-400" : "border-obsidian/20 focus:border-obsidian"}`}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-obsidian/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-alabaster shadow-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl">
        <div className="px-8 py-6 border-b border-obsidian/10">
          <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-dustyrose">Checkout — {product.name}</p>
        </div>
        <div className="overflow-y-auto flex-1 px-8 py-8">
          {step === "details" && (
            <div className="flex flex-col gap-5">
              {field("fullName", "Full Name")}
              {field("email", "Email")}
              {field("phone", "Phone")}
              {field("address", "Address")}
              <div className="grid grid-cols-3 gap-4">
                {field("city", "City")}
                {field("state", "State")}
                {field("pincode", "Pincode")}
              </div>
              <button onClick={() => validateDetails() && setStep("payment")} className="mt-4 w-full bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-[#111] font-bold py-4 font-sans uppercase text-[11px] tracking-widest rounded-xl transition-all active:scale-95">Continue</button>
            </div>
          )}
          {step === "payment" && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                {!codEnabled && (
                  <div className="p-4 border border-obsidian/10 bg-gray-50 opacity-60 rounded-xl">
                    <p className="text-[10px] uppercase tracking-widest text-obsidian/40 flex items-center gap-2">
                       <Ban size={12} /> Cash on Delivery (Unavailable)
                    </p>
                    <p className="text-[11px] mt-1 text-obsidian/30">We currently accept online payments only for secure doorstep delivery.</p>
                  </div>
                )}
                {codEnabled && (
                  <button onClick={() => setPayment({method:'cod', upiId:''})} className={`p-4 border text-left ${payment.method === 'cod' ? 'border-burgundy bg-burgundy/5' : 'border-obsidian/10'}`}>COD</button>
                )}
                {upiEnabled && (
                  <div className={`p-4 border ${payment.method === 'upi' ? 'border-burgundy bg-burgundy/5' : 'border-obsidian/10'}`}>
                    <button onClick={() => setPayment((p) => ({...p, method:'upi'}))} className="w-full text-left">UPI</button>
                    {payment.method === 'upi' && <input placeholder="name@upi" className="w-full mt-2 border-b" onChange={(e)=>setPayment(p=>({...p, upiId: e.target.value}))}/>}
                  </div>
                )}
              </div>
              <button onClick={handlePayNow} disabled={processing} className="w-full bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-[#111] font-bold py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50">{processing ? "Processing..." : "Place Order"}</button>
            </div>
          )}
          {step === "success" && (
            <div className="text-center py-10">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-serif">Order Confirmed!</h2>
              <button onClick={onClose} className="mt-8 text-dustyrose font-sans uppercase text-[11px]">Back to Store</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { Product } from "@/data/products";

export default function ProductDetailClient({ initialProduct }: { initialProduct?: Product }) {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const { addItem } = useCart();
  const [showPayment, setShowPayment] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { products } = useProductStore();
  const product = initialProduct || products.find((p) => p.id === id);
  const router = useRouter();
  const { isSignedIn } = useUser();

  const images = (product?.images && product.images.length > 0) 
    ? product.images 
    : [product?.image || ""];

  useEffect(() => { setMounted(true); window.scrollTo(0, 0); }, [id]);

  if (!product) return notFound();
  if (!mounted) return <div className="min-h-screen bg-alabaster animate-pulse" />;

  const allImages = (product.images && product.images.length > 0) ? product.images : [product.image];

  return (
    <div className="flex flex-col min-h-screen bg-alabaster pt-32 pb-16 px-4 md:px-12">
      {showPayment && <PaymentModal product={product} onClose={() => setShowPayment(false)} />}
      
      {/* Lightbox Modal */}
      {showLightbox && (
        <div 
          className="fixed inset-0 z-[300] bg-black/98 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 animate-in fade-in zoom-in duration-300"
          onClick={() => setShowLightbox(false)}
        >
          <button 
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-all hover:scale-110 p-2 z-[310]"
            onClick={() => setShowLightbox(false)}
          >
            <X size={40} strokeWidth={1.5} />
          </button>
          
          {images.length > 1 && (
            <>
              <button 
                className="absolute left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-all hover:scale-110 p-4 z-[310]"
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length); }}
              >
                <ChevronLeft size={48} strokeWidth={1} />
              </button>
              <button 
                className="absolute right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-all hover:scale-110 p-4 z-[310]"
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev + 1) % images.length); }}
              >
                <ChevronRight size={48} strokeWidth={1} />
              </button>
            </>
          )}

          <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
            <Image 
              src={images[currentImageIndex]} 
              alt={product.name} 
              fill 
              className="object-contain" 
              priority 
            />
          </div>

          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 pointer-events-none">
             <p className="text-white/40 font-mono text-[10px] tracking-[0.3em] uppercase">
                {currentImageIndex + 1} / {images.length} — {product.name}
             </p>
          </div>
        </div>
      )}

      <div className="container mx-auto flex flex-col md:flex-row gap-8 lg:gap-16">
        {/* Image Section */}
        <div className="w-full md:w-[50%] flex flex-col gap-6">
          <div 
            className="w-full aspect-[4/5] max-h-[600px] relative overflow-hidden rounded-3xl bg-[#F7F7F7] cursor-zoom-in group shadow-sm ring-1 ring-black/10 transition-all duration-500 hover:ring-obsidian/20"
            onClick={() => setShowLightbox(true)}
          >
            <Image 
              src={images[currentImageIndex]} 
              alt={product.name} 
              fill 
              className="object-cover transition-all duration-1000 ease-out group-hover:scale-105 rounded-3xl" 
              priority 
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-3xl pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-md w-10 h-10 rounded-full flex items-center justify-center border border-white/30 opacity-0 group-hover:opacity-100 transition-all duration-300">
               <ShoppingBag className="w-4 h-4 text-white" strokeWidth={1.5} />
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-4 px-2 overflow-x-auto no-scrollbar">
              {images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all duration-500 ring-offset-2 bg-sand/10 ${currentImageIndex === idx ? 'ring-2 ring-dustyrose scale-105' : 'opacity-60 hover:opacity-100'}`}
                >
                  <Image src={img} alt={`${product.name} ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-full md:w-[50%] flex flex-col justify-center py-4">
          <p className="text-[10px] font-sans uppercase tracking-[0.3em] text-dustyrose mb-4">{product.category}</p>
          <h1 className="text-3xl md:text-5xl font-serif text-obsidian mb-4 leading-tight">{product.name}</h1>
          <p className="text-xl md:text-2xl font-sans mb-8">₹{product.price.toFixed(2)}</p>
          <div className="h-px w-12 bg-dustyrose/30 mb-8" />
          <p className="text-sm font-light text-obsidian/70 leading-relaxed mb-10 max-w-lg">{product.description}</p>
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <MagneticButton onClick={() => isSignedIn ? addItem(product) : router.push("/login")} className="sm:w-1/2">Add to Cart</MagneticButton>
            <MagneticButton onClick={() => isSignedIn ? setShowPayment(true) : router.push("/login")} className="sm:w-1/2" variant="secondary">Buy Now</MagneticButton>
          </div>

          {/* Trust Badges / Extra Details */}
          <div className="flex flex-col gap-8 border-t border-obsidian/10 pt-8 mt-4">
            {/* Group 1: Policy & Service */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-dustyrose/10 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4 text-dustyrose" />
                </div>
                <div>
                  <p className="text-[10px] font-sans uppercase tracking-[0.1em] font-bold text-obsidian">Replacement Policy</p>
                  <p className="text-[11px] text-obsidian/60 font-light">Replacement only if the product is received damaged.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-500/10 flex items-center justify-center">
                  <Ban className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-[10px] font-sans uppercase tracking-[0.1em] font-bold text-obsidian">No Cash on Delivery</p>
                  <p className="text-[11px] text-obsidian/60 font-light">We accept all major online payments for security.</p>
                </div>
              </div>
            </div>

            {/* Group 2: Quality & Fit with Minimal Topic */}
            <div className="flex flex-col gap-5 pt-2">
              <h3 className="text-[9px] font-mono font-medium text-dustyrose uppercase tracking-[0.25em] mb-1">Quality & Fit</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-dustyrose/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-dustyrose" />
                  </div>
                  <div>
                    <p className="text-[10px] font-sans uppercase tracking-[0.1em] font-bold text-obsidian">Universal Fit</p>
                    <p className="text-[11px] text-obsidian/60 font-light">Free-size and adjustable designs for everyone.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-dustyrose/10 flex items-center justify-center">
                    <Smile className="w-4 h-4 text-dustyrose" />
                  </div>
                  <div>
                    <p className="text-[10px] font-sans uppercase tracking-[0.1em] font-bold text-obsidian">Skin Friendly</p>
                    <p className="text-[11px] text-obsidian/60 font-light">Lead & Nickel free, safe for sensitive skin.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-dustyrose/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-dustyrose" />
                  </div>
                  <div>
                    <p className="text-[10px] font-sans uppercase tracking-[0.1em] font-bold text-obsidian">Premium Quality</p>
                    <p className="text-[11px] text-obsidian/60 font-light">High-durability, tarnish-resistant craftsmanship.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

