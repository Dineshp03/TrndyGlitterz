"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, X, ChevronRight, Loader2, CreditCard, ShieldCheck } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useOrderStore } from "@/store/useOrderStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useUser, useAuth } from "@clerk/nextjs";

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
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

export default function CartCheckoutModal({ onClose }: { onClose: () => void }) {
  const { items, getCartTotal, clearCart } = useCart();
  const { placeOrder } = useOrderStore();
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken } = useAuth();
  
  const [step, setStep] = useState<Step>("details");
  const [details, setDetails] = useState<UserDetails>(emptyDetails);
  
  // Pre-fill from Clerk — all saved profile fields
  useEffect(() => {
    if (userLoaded && user) {
      setDetails(prev => ({
        ...prev,
        fullName: user.fullName || "",
        email: user.primaryEmailAddress?.emailAddress || "",
        phone:   (user.unsafeMetadata?.phone   as string) || "",
        address: (user.unsafeMetadata?.address as string) || "",
        city:    (user.unsafeMetadata?.city    as string) || "",
        state:   (user.unsafeMetadata?.state   as string) || "",
        pincode: (user.unsafeMetadata?.pincode as string) || "",
      }));
    }
  }, [user, userLoaded]);

  // Detect if address is incomplete (to show reminder)
  const isAddressIncomplete = userLoaded && user &&
    !(user.unsafeMetadata?.address as string);
  
  const [payment] = useState<PaymentDetails>({
    method: "razorpay",
    upiId: "",
  });
  const [errors, setErrors] = useState<Partial<UserDetails>>({});
  const [processing, setProcessing] = useState(false);

  const total = getCartTotal();

  // Prevent body scroll
  useEffect(() => {
    // Save original overflow
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
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
    setErrors({});
    return true;
  };

  /* ---------- handlers ---------- */
  const handleDetailsNext = () => {
    if (validateDetails()) setStep("payment");
  };

  const handlePayNow = async () => {
    if (!validatePayment()) return;
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
          amount: total,
          receipt: `cart_${Date.now()}`,
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
        description: `Order for ${items.length} item(s)`,
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
            // Get a fresh Clerk token since the previous one may have expired during the payment process
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
            const payload = {
              clerk_user_id: user?.id,
              customer_name: details.fullName,
              customer_email: details.email,
              customer_phone: details.phone,
              address: `${details.address}, ${details.city}, ${details.state} - ${details.pincode}`,
              city: details.city,
              state: details.state,
              pincode: details.pincode,
              total: total,
              payment_method: "razorpay",
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              items: items.map(item => ({
                product_id: item.productId || item.id,
                product_name: item.name,
                product_image: item.image,
                price: item.price,
                quantity: item.quantity
              }))
            };

            const result = await placeOrder(payload, freshToken);

            if (result.success) {
              const { newOrdersNotif } = useSettingsStore.getState();
              if (newOrdersNotif) {
                useNotificationStore.getState().addNotification({
                  title: "New Order Received",
                  message: `${details.fullName} placed an order for ${items.length} item(s)`,
                  type: "order"
                });
              }
              setStep("success");
              clearCart();
            } else {
              alert(result.error || "Failed to place order. Please try again.");
            }
          } catch (verifyError) {
            const err = verifyError as Error;
            console.error("Verification error:", err);
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
        console.error("Payment failed:", response.error);
        alert(`Payment failed: ${response.error.description || "Please try again."}`);
        setProcessing(false);
      });

      rzp.open();
    } catch (error) {
      const err = error as Error;
      console.error("Checkout error:", err);
      alert(err.message || "Something went wrong. Please try again.");
      setProcessing(false);
    }
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
      onClick={(e) => {
        if (e.target === e.currentTarget && step !== "success") onClose();
      }}
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
            <p className="font-serif text-obsidian text-lg mt-0.5">Checkout</p>
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
        <div className="overflow-y-auto flex-1 px-4 sm:px-8 py-6 sm:py-8">
          {/* ---- Step 1: User Details ---- */}
          {step === "details" && (
            <div className="flex flex-col gap-5">
              {/* Profile reminder banner */}
              {isAddressIncomplete && (
                <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-lg">
                  <span className="text-amber-500 mt-0.5 flex-shrink-0">💡</span>
                  <div className="flex-1">
                    <p className="text-[11px] font-sans font-semibold text-amber-800">Save your address for faster checkout!</p>
                    <p className="text-[10px] text-amber-700 mt-0.5 leading-relaxed">
                      Add your delivery address in{" "}
                      <a href="/profile" target="_blank" className="underline font-semibold hover:text-amber-900">
                        My Profile
                      </a>{" "}
                      — it will auto-fill here next time.
                    </p>
                  </div>
                </div>
              )}

              {/* Cart summary preview */}
              <div className="p-4 bg-sand/30 border border-obsidian/10 mb-2 max-h-40 overflow-y-auto">
                <p className="text-[10px] uppercase font-sans tracking-[0.2em] text-obsidian/60 mb-3 border-b border-obsidian/10 pb-2">
                  Order Summary ({items.reduce((acc, i) => acc + i.quantity, 0)} items)
                </p>
                <div className="flex flex-col gap-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <Link 
                        href={`/product/${item.id}`}
                        onClick={onClose}
                        className="relative w-10 aspect-[3/4] flex-shrink-0 overflow-hidden hover:opacity-80 transition-opacity"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </Link>
                      <div className="flex-1">
                        <Link 
                          href={`/product/${item.id}`}
                          onClick={onClose}
                          className="hover:text-burgundy transition-colors"
                        >
                          <p className="text-sm font-serif text-obsidian line-clamp-1">{item.name}</p>
                        </Link>
                        <div className="flex justify-between items-center text-xs font-sans text-obsidian/60 mt-1">
                          <span>Qty: {item.quantity}</span>
                          <span className="tabular-nums font-medium text-obsidian">₹{item.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
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
              <div className="flex flex-col gap-4">
                {/* Razorpay Option */}
                <div 
                  className="flex items-start gap-4 p-5 border border-burgundy bg-burgundy/5 rounded-xl relative overflow-hidden group transition-all"
                >
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <CreditCard size={40} className="text-burgundy" />
                  </div>
                  <div className="mt-1">
                     <div className="w-4 h-4 rounded-full border-4 border-burgundy bg-white flex items-center justify-center" />
                  </div>
                  <div className="w-full">
                    <p className="text-sm font-serif text-obsidian flex items-center gap-2">
                      Online Payment (Razorpay)
                      <ShieldCheck size={14} className="text-green-600" />
                    </p>
                    <p className="text-[11px] font-sans text-obsidian/50 mt-1 leading-relaxed">
                      Secure checkout via UPI, Cards, Netbanking, or Wallets.
                    </p>
                  </div>
                </div>
              </div>

              {/* Order summary */}
              <div className="mt-2 border-t border-obsidian/10 pt-4 flex flex-col gap-2 text-xs font-sans text-obsidian/70">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-obsidian">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between font-medium text-obsidian text-sm mt-2 pt-2 border-t border-obsidian/10">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
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
                  Thank you, <span className="font-medium text-obsidian">{details.fullName}</span>. Your order has been confirmed and will be delivered to{" "}
                  <span className="font-medium text-obsidian">{details.city}</span>.
                </p>
              </div>
              <div className="w-full border border-obsidian/10 p-4 text-left flex flex-col gap-2 text-xs font-sans text-obsidian/60">
                <div className="flex justify-between">
                  <span>Payment Method</span>
                  <span className="uppercase font-medium text-obsidian">
                    Online Payment (Razorpay)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery to</span>
                  <span className="font-medium text-obsidian">{details.pincode}, {details.state}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount</span>
                  <span className="font-medium text-obsidian">₹{total.toFixed(2)}</span>
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
