"use client";

import Image from "next/image";
import { useParams, notFound, useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";
import { useState, useEffect, useRef, useCallback, TouchEvent } from "react";
import { useProductStore } from "@/store/useProductStore";
import { useCart } from "@/hooks/useCart";
import { useOrderStore } from "@/store/useOrderStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { CheckCircle, X, ChevronRight, ChevronLeft, Loader2, ShoppingBag, CreditCard, ShieldCheck, RotateCcw, Sparkles, Smile, Shield, MessageSquare } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  useSwipe — reusable touch-swipe hook                               */
/* ------------------------------------------------------------------ */
function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void, threshold = 40) {
  const startX = useRef<number | null>(null);

  const onTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches && e.touches.length > 0) {
      startX.current = e.touches[0].clientX;
    }
  }, []);

  const onTouchEnd = useCallback((e: TouchEvent) => {
    if (startX.current === null) return;
    if (e.changedTouches && e.changedTouches.length > 0) {
      const diff = startX.current - e.changedTouches[0].clientX;
      if (Math.abs(diff) >= threshold) {
        if (diff > 0) onSwipeLeft();
        else onSwipeRight();
      }
    }
    startX.current = null;
  }, [onSwipeLeft, onSwipeRight, threshold]);

  return { onTouchStart, onTouchEnd };
}

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

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment?: string;
  created_at: string;
}

interface ReviewSummary {
  count: number;
  average: number;
  breakdown: Record<number, number>;
}

interface RazorpayFailedResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: {
      order_id: string;
      payment_id: string;
    };
  };
}

interface RazorpayInstance {
  on: (event: "payment.failed", callback: (response: RazorpayFailedResponse) => void) => void;
  open: () => void;
}

interface RazorpayConstructor {
  new (options: unknown): RazorpayInstance;
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
  product: { name: string; price: number; image: string; id?: string };
  onClose: () => void;
}) {
  const { placeOrder } = useOrderStore();
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken } = useAuth();
  
  const [step, setStep] = useState<Step>("details");
  const [details, setDetails] = useState<UserDetails>(emptyDetails);
  
  // Pre-fill
  useEffect(() => {
    if (userLoaded && user) {
      setDetails(prev => ({
        ...prev,
        fullName: user.fullName || "",
        email: user.primaryEmailAddress?.emailAddress || "",
        phone: (user.unsafeMetadata?.phone as string) || "",
        address: (user.unsafeMetadata?.address as string) || "",
        city: (user.unsafeMetadata?.city as string) || "",
        state: (user.unsafeMetadata?.state as string) || "",
        pincode: (user.unsafeMetadata?.pincode as string) || "",
      }));
    }
  }, [user, userLoaded]);

  const [errors, setErrors] = useState<Partial<UserDetails>>({});
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

  const handlePayNow = async () => {
    setProcessing(true);
    try {
      const token = await getToken();

      // Step 1: Create Razorpay order via backend
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          amount: product.price,
          receipt: `bn_${Date.now()}`,
        }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.error || "Failed to create order");
      }

      const { order_id, amount: amountPaise, currency } = await orderRes.json();

      // Step 2: Open Razorpay checkout modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amountPaise,
        currency,
        name: "Trendy Glitterz",
        description: product.name,
        order_id,
        prefill: {
          name: details.fullName,
          email: details.email,
          contact: details.phone,
        },
        theme: {
          color: "#8B2252",
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            // Get a fresh token — the original may have expired during payment
            const freshToken = await getToken();

            // Step 3: Verify payment signature
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(freshToken ? { Authorization: `Bearer ${freshToken}` } : {}),
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyRes.ok) {
              const err = await verifyRes.json();
              throw new Error(err.error || "Payment verification failed");
            }

            // Step 4: Place order in database after verification
            const result = await placeOrder({
              clerk_user_id: user?.id,
              customer_name: details.fullName,
              customer_email: details.email,
              customer_phone: details.phone,
              address: `${details.address}, ${details.city}, ${details.state} - ${details.pincode}`,
              city: details.city,
              state: details.state,
              pincode: details.pincode,
              total: product.price,
              payment_method: "razorpay",
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              items: [{
                product_id: product.id,
                product_name: product.name,
                product_image: product.image,
                price: product.price,
                quantity: 1
              }]
            }, freshToken);

            if (result.success) {
              setStep("success");
            } else {
              alert(result.error || "Failed to place order.");
            }
          } catch (verifyError) {
            const err = verifyError as Error;
            console.warn("Verification error:", err);
            alert(err.message || "Payment verification failed. Please contact support.");
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          },
        },
      };

      const rzp = new (window as Window & { Razorpay?: RazorpayConstructor }).Razorpay!(options);

      rzp.on("payment.failed", (response) => {
        const err = response?.error || {};
        console.warn("Payment failed:", err);
        alert(`Payment failed: ${err.description || err.reason || "Please try again."}`);
        setProcessing(false);
      });

      rzp.open();
    } catch (err) {
      const error = err as Error;
      console.error(error);
      alert(error.message || "Something went wrong.");
      setProcessing(false);
    }
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 transform-gpu">
      <div className="absolute inset-0 bg-obsidian/60 backdrop-blur-sm transform-gpu" onClick={onClose} />
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
                <div className="p-5 border border-burgundy bg-burgundy/5 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <CreditCard size={40} className="text-burgundy" />
                  </div>
                  <p className="text-sm font-serif text-obsidian flex items-center gap-2">
                    Online Payment (Razorpay)
                    <ShieldCheck size={14} className="text-green-600" />
                  </p>
                  <p className="text-[11px] font-sans text-obsidian/60 mt-1.5 leading-relaxed max-w-[80%]">
                    Pay securely via UPI, Cards, or Netbanking. Powered by Razorpay.
                  </p>
                </div>
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

// Helper to parse description text into styled HTML elements (bullet points, section headers, etc.)
const renderDescription = (desc?: string) => {
  if (!desc) return null;
  const lines = desc.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${index}`} className="list-disc pl-5 mb-3 space-y-1.5 text-xs md:text-sm font-light text-obsidian/70">
            {currentList.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        );
        currentList = [];
      }
      return;
    }

    const isBullet = trimmed.startsWith("-") || trimmed.startsWith("*") || trimmed.startsWith("•") || trimmed.startsWith("+");

    if (isBullet) {
      const bulletText = trimmed.replace(/^[-*•+]\s*/, "");
      currentList.push(bulletText);
    } else {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${index}`} className="list-disc pl-5 mb-3 space-y-1.5 text-xs md:text-sm font-light text-obsidian/70">
            {currentList.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        );
        currentList = [];
      }

      if (trimmed.endsWith(":")) {
        elements.push(
          <h4 key={`header-${index}`} className="font-semibold text-obsidian text-xs md:text-sm mt-4 mb-1.5">
            {trimmed}
          </h4>
        );
      } else {
        elements.push(
          <p key={`p-${index}`} className="text-xs md:text-sm font-light text-obsidian/70 leading-relaxed mb-2.5">
            {trimmed}
          </p>
        );
      }
    }
  });

  if (currentList.length > 0) {
    elements.push(
      <ul key="list-final" className="list-disc pl-5 mb-3 space-y-1.5 text-xs md:text-sm font-light text-obsidian/70">
        {currentList.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }

  return <div className="space-y-1">{elements}</div>;
};

export default function ProductDetailClient({ initialProduct }: { initialProduct?: Product }) {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const { addItem } = useCart();
  const [showPayment, setShowPayment] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [slideDir, setSlideDir] = useState<"left" | "right" | null>(null);
  const { products, fetchProducts } = useProductStore();
  const [fetchedProduct, setFetchedProduct] = useState<Product | null>(initialProduct || null);
  const [fetchingProduct, setFetchingProduct] = useState(false);
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [id]);

  useEffect(() => {
    if (initialProduct) {
      setFetchedProduct(initialProduct);
      return;
    }
    const found = products.find((p) => p.id === id);
    if (found) {
      setFetchedProduct(found);
    } else if (id && !fetchingProduct) {
      setFetchingProduct(true);
      fetchProducts().finally(() => setFetchingProduct(false));
    }
  }, [id, initialProduct, products, fetchProducts, fetchingProduct]);

  const product = fetchedProduct || products.find((p) => p.id === id);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary>({
    count: 0,
    average: 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!product?.id) return;
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setSummary(data.summary || { count: 0, average: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoadingReviews(false);
    }
  }, [product?.id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !product?.id) return;

    setSubmittingReview(true);
    try {
      const token = await getToken();
      const response = await fetch(`/api/products/${product.id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
          user_name: user?.fullName || user?.primaryEmailAddress?.emailAddress?.split("@")[0] || "Verified Customer",
          user_email: user?.primaryEmailAddress?.emailAddress || "",
          clerk_id: user?.id,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        alert(err.error || "Failed to submit review");
        return;
      }

      setComment("");
      setRating(5);
      fetchReviews();
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const images = (product?.images && product.images.length > 0)
    ? [product.image, ...product.images].filter(Boolean) as string[]
    : [product?.image || ""];

  const isSoldOut = Boolean(product?.isSoldOut || (product as any)?.is_sold_out || product?.soldOut);

  /* Swipe navigation helpers */
  const goNext = useCallback(() => {
    if (images.length <= 1) return;
    setSlideDir("left");
    setCurrentImageIndex((p) => (p + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    if (images.length <= 1) return;
    setSlideDir("right");
    setCurrentImageIndex((p) => (p - 1 + images.length) % images.length);
  }, [images.length]);

  /* Swipe hook for main viewer & lightbox */
  const mainSwipe = useSwipe(goNext, goPrev);
  const lightboxSwipe = useSwipe(goNext, goPrev);

  /* Reset slide animation after it plays */
  useEffect(() => {
    if (slideDir) {
      const t = setTimeout(() => setSlideDir(null), 320);
      return () => clearTimeout(t);
    }
  }, [slideDir]);

  if (!mounted || (fetchingProduct && !product)) {
    return (
      <div className="min-h-screen bg-alabaster flex flex-col items-center justify-center p-8 pt-32">
        <Loader2 className="w-8 h-8 animate-spin text-dustyrose mb-4" />
        <p className="text-xs font-mono uppercase text-obsidian/40 tracking-widest">Loading Details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-alabaster flex flex-col items-center justify-center text-center p-6 pt-32">
        <h2 className="text-3xl font-serif text-obsidian mb-4">Product Not Found</h2>
        <p className="text-obsidian/60 max-w-md font-sans text-xs mb-6">
          The requested item is either unavailable or has been removed.
        </p>
        <button
          onClick={() => router.push("/catalog")}
          className="bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-[#111] font-bold py-3.5 px-8 rounded-xl font-sans uppercase text-[11px] tracking-widest shadow-md hover:scale-105 active:scale-95 transition-all"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-alabaster pt-32 pb-16 px-4 md:px-12">
      {showPayment && <PaymentModal product={product} onClose={() => setShowPayment(false)} />}
      
      {/* ── Lightbox Modal ── */}
      {showLightbox && (
        <div
          className="fixed inset-0 z-[300] bg-black md:bg-black/98 md:backdrop-blur-xl flex items-center justify-center p-4 md:p-12 animate-in fade-in zoom-in duration-300 transform-gpu"
          onClick={() => setShowLightbox(false)}
          {...lightboxSwipe}
        >
          <button
            className="absolute top-6 right-6 md:top-8 md:right-8 text-white/50 hover:text-white transition-all hover:scale-110 p-2 z-[310]"
            onClick={() => setShowLightbox(false)}
          >
            <X size={36} strokeWidth={1.5} />
          </button>

          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-all hover:scale-110 p-3 z-[310] hidden md:flex"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
              >
                <ChevronLeft size={48} strokeWidth={1} />
              </button>
              <button
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-all hover:scale-110 p-3 z-[310] hidden md:flex"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
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

          {/* Counter + dots */}
          <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-3 pointer-events-none">
            {images.length > 1 && (
              <div className="flex items-center gap-1.5">
                {images.map((_, di) => (
                  <div
                    key={di}
                    className={`rounded-full transition-all duration-300 ${di === currentImageIndex ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/30"}`}
                  />
                ))}
              </div>
            )}
            <p className="text-white/40 font-mono text-[10px] tracking-[0.3em] uppercase">
              {currentImageIndex + 1} / {images.length} — {product.name}
            </p>
          </div>
        </div>
      )}

      <div className="container mx-auto flex flex-col md:flex-row gap-8 lg:gap-16">
        {/* ── Image Section ── */}
        <div className="w-full md:w-[50%] flex flex-col gap-4">

          {/* Main viewer */}
          <div
            className="w-full aspect-square md:aspect-[4/5] max-h-[380px] md:max-h-[600px] max-w-[380px] md:max-w-none mx-auto relative overflow-hidden rounded-3xl bg-[#F7F7F7] cursor-zoom-in group shadow-sm ring-1 ring-black/10 transition-all duration-500 hover:ring-obsidian/20 select-none"
            onClick={() => setShowLightbox(true)}
            {...mainSwipe}
          >
            {/* Sliding image — key forces remount on index change for instant swap */}
            <div
              key={currentImageIndex}
              className="absolute inset-0"
              style={{
                animation: slideDir
                  ? `slideIn${slideDir === "left" ? "Left" : "Right"} 0.3s cubic-bezier(0.25,1,0.5,1) both`
                  : undefined,
              }}
            >
              <Image
                src={images[currentImageIndex]}
                alt={product.name}
                fill
                className={`object-cover md:group-hover:scale-105 md:transition-transform md:duration-700 ease-out rounded-3xl ${isSoldOut ? 'opacity-70 grayscale-[30%]' : ''}`}
                priority
              />
            </div>

            <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-3xl pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Sold Out badge on main image viewer */}
            {isSoldOut && (
              <div className="absolute top-4 left-4 bg-[#ff4d4f] text-white text-[10px] font-mono font-bold px-3 py-1 rounded-full tracking-wider uppercase z-10 shadow-sm">
                Sold Out
              </div>
            )}

            {/* Image counter pill */}
            {images.length > 1 && (
              <div className="absolute top-4 right-4 bg-black/70 md:bg-black/50 md:backdrop-blur-md text-white text-[10px] font-mono px-2.5 py-1 rounded-full tracking-wider">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}

            {/* Desktop prev/next arrows */}
            {images.length > 1 && (
              <>
                <button
                  className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm w-9 h-9 rounded-full items-center justify-center text-obsidian opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white shadow-md z-10"
                  onClick={(e) => { e.stopPropagation(); goPrev(); }}
                >
                  <ChevronLeft size={18} strokeWidth={1.5} />
                </button>
                <button
                  className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm w-9 h-9 rounded-full items-center justify-center text-obsidian opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white shadow-md z-10"
                  onClick={(e) => { e.stopPropagation(); goNext(); }}
                >
                  <ChevronRight size={18} strokeWidth={1.5} />
                </button>
              </>
            )}

            {/* Mobile swipe dots */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 md:hidden pointer-events-none">
                {images.map((_, di) => (
                  <div
                    key={di}
                    className={`rounded-full transition-all duration-300 ${di === currentImageIndex ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnail rail (desktop) */}
          {images.length > 1 && (
            <div className="hidden md:flex gap-3 px-1 overflow-x-auto no-scrollbar max-w-full">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => { setSlideDir(idx > currentImageIndex ? "left" : "right"); setCurrentImageIndex(idx); }}
                  className={`relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden transition-all duration-300 ring-offset-alabaster ${
                    currentImageIndex === idx
                      ? "ring-2 ring-dustyrose scale-105 shadow-md"
                      : "opacity-50 hover:opacity-90 hover:scale-105"
                  }`}
                >
                  <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Mobile thumbnail rail (scrollable, slightly smaller) */}
          {images.length > 1 && (
            <div className="flex md:hidden gap-2.5 px-1 overflow-x-auto no-scrollbar max-w-[380px] mx-auto w-full pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => { setSlideDir(idx > currentImageIndex ? "left" : "right"); setCurrentImageIndex(idx); }}
                  className={`relative flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden transition-all duration-300 ${
                    currentImageIndex === idx
                      ? "ring-2 ring-dustyrose scale-105"
                      : "opacity-50 active:opacity-90"
                  }`}
                >
                  <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-full md:w-[50%] flex flex-col justify-center py-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-sans uppercase tracking-[0.3em] text-dustyrose">{product.category}</p>
            {isSoldOut && (
              <span className="bg-[#ff4d4f]/10 text-[#ff4d4f] text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-[#ff4d4f]/20">
                Sold Out
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-serif text-obsidian mb-4 leading-tight">{product.name}</h1>
          <p className="text-xl md:text-2xl font-sans mb-8">₹{product.price.toFixed(2)}</p>
          <div className="h-px w-12 bg-dustyrose/30 mb-8" />
          <div className="mb-10 max-w-lg">
            {renderDescription(product.description)}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <MagneticButton 
              onClick={() => isSignedIn ? addItem(product) : router.push("/login")} 
              disabled={isSoldOut}
              className="sm:w-1/2"
            >
              {isSoldOut ? "Sold Out" : "Add to Cart"}
            </MagneticButton>
            <MagneticButton 
              onClick={() => isSignedIn ? setShowPayment(true) : router.push("/login")} 
              disabled={isSoldOut}
              className="sm:w-1/2" 
              variant="secondary"
            >
              Buy Now
            </MagneticButton>
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
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-[10px] font-sans uppercase tracking-[0.1em] font-bold text-obsidian">Online Only Payment</p>
                  <p className="text-[11px] text-obsidian/60 font-light">Secure payments via Razorpay (UPI, Cards, Netbanking).</p>
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

      {/* ── Reviews Section ── */}
      <div className="h-px bg-obsidian/10 my-16 container mx-auto" />
      
      <div className="container mx-auto max-w-5xl pb-16 px-2">
        <h2 className="text-3xl font-serif text-obsidian mb-8 flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-dustyrose" strokeWidth={1.5} />
          Customer Reviews
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* Summary Column */}
          <div className="lg:col-span-1 bg-[#111111]/5 border border-obsidian/10 rounded-3xl p-8 space-y-6">
            <div>
              <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-dustyrose mb-2">Rating Summary</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-sans font-bold text-obsidian">{summary.average}</span>
                <span className="text-sm font-sans text-obsidian/40">/ 5</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                      key={star} 
                      className={`text-lg ${star <= Math.round(summary.average) ? 'text-[#D4AF37]' : 'text-obsidian/20'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-xs text-obsidian/50">({summary.count} {summary.count === 1 ? 'review' : 'reviews'})</span>
              </div>
            </div>

            {/* Breakdown bars */}
            <div className="space-y-3 pt-4 border-t border-obsidian/10">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = summary.breakdown?.[stars] || 0;
                const pct = summary.count > 0 ? Math.round((count / summary.count) * 100) : 0;
                return (
                  <div key={stars} className="flex items-center gap-3 text-xs">
                    <span className="w-10 text-obsidian/60 text-[11px] font-sans shrink-0 font-medium">{stars} Star</span>
                    <div className="flex-1 h-1.5 bg-obsidian/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#BF953F] to-[#FCF6BA] rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-obsidian/40 font-mono text-[10px] shrink-0">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews List & Write Form Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Submit review form */}
            <div className="bg-[#111111]/5 border border-obsidian/10 rounded-3xl p-8">
              <h3 className="text-lg font-serif text-obsidian mb-4">Share Your Thoughts</h3>
              
              {isSignedIn ? (
                <form onSubmit={handleSubmitReview} className="space-y-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-sans uppercase tracking-widest text-obsidian/50">Your Rating</label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          className="text-2xl transition-all duration-150 transform hover:scale-110 active:scale-90"
                        >
                          <span 
                            className={star <= (hoverRating ?? rating) ? "text-[#D4AF37]" : "text-obsidian/20"}
                          >
                            ★
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="review-comment" className="text-[10px] font-sans uppercase tracking-widest text-obsidian/50">Your Review</label>
                    <textarea
                      id="review-comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="What did you like or dislike about this product? How is the quality?"
                      rows={4}
                      className="w-full bg-transparent border border-obsidian/10 focus:border-obsidian rounded-2xl p-4 text-sm font-sans outline-none resize-none transition-colors"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview || !comment.trim()}
                    className="bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-[#111] font-bold py-3.5 px-8 rounded-xl font-sans uppercase text-[11px] tracking-widest hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-40 disabled:pointer-events-none shadow-md shadow-[#D4AF37]/10"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              ) : (
                <div className="text-center py-6 px-4 bg-obsidian/5 rounded-2xl border border-obsidian/5 flex flex-col items-center justify-center space-y-4">
                  <p className="text-sm text-obsidian/60 font-sans font-light">
                    Only registered customers can leave a review.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="px-6 py-2.5 bg-obsidian text-alabaster text-xs font-mono uppercase tracking-widest hover:bg-dustyrose transition-colors rounded-full"
                  >
                    Login to Write a Review
                  </button>
                </div>
              )}
            </div>

            {/* List of reviews */}
            <div className="space-y-6">
              <h3 className="text-lg font-serif text-obsidian border-b border-obsidian/10 pb-4">
                User Reviews ({reviews.length})
              </h3>

              {loadingReviews ? (
                <div className="flex items-center gap-2 text-obsidian/50 py-4 font-sans text-sm font-light">
                  <Loader2 className="w-4 h-4 animate-spin text-dustyrose" /> Loading reviews...
                </div>
              ) : reviews.length === 0 ? (
                <p className="text-sm font-light text-obsidian/50 italic py-4">
                  No reviews yet. Be the first to review this product!
                </p>
              ) : (
                <div className="divide-y divide-obsidian/10">
                  {reviews.map((rev) => {
                    const initials = rev.user_name
                      ? rev.user_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
                      : "U";
                    const formattedDate = new Date(rev.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });

                    return (
                      <div key={rev.id} className="py-6 first:pt-0 last:pb-0 flex gap-4 items-start">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#BF953F]/20 to-[#B38728]/10 border border-[#D4AF37]/20 flex items-center justify-center text-xs font-sans font-bold text-dustyrose uppercase shrink-0">
                          {initials}
                        </div>

                        {/* Review Content */}
                        <div className="flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-sans font-semibold text-sm text-obsidian">{rev.user_name}</span>
                              <span className="text-[9px] font-mono uppercase bg-green-500/10 text-green-700 px-2 py-0.5 rounded-full border border-green-500/20 font-semibold tracking-wider">
                                Verified Buyer
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-obsidian/40">{formattedDate}</span>
                          </div>

                          {/* Stars */}
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span 
                                key={star} 
                                className={`text-sm ${star <= rev.rating ? 'text-[#D4AF37]' : 'text-obsidian/20'}`}
                              >
                                ★
                              </span>
                            ))}
                          </div>

                          <p className="text-sm font-sans font-light text-obsidian/80 leading-relaxed pt-1">
                            {rev.comment}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

