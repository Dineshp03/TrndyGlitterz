"use client";

import Link from "next/link";

export default function ReturnAndRefundPolicy() {
  return (
    <main className="bg-alabaster text-obsidian min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-12 border-b border-obsidian/10 text-center">
        <p className="text-[10px] font-sans uppercase tracking-[0.3em] text-obsidian/40 mb-4">Returns</p>
        <h1 className="text-4xl md:text-6xl font-serif tracking-tight text-obsidian">Return & Refund Policy</h1>
        <p className="mt-4 text-sm font-sans text-obsidian/50">Last updated: March 12, 2024</p>
      </section>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-16 space-y-12">
        {/* Intro */}
        <div className="space-y-4 text-sm font-sans leading-relaxed text-obsidian/80">
          <p className="text-base font-serif text-obsidian">
            As jewellery is a personal-use product, we follow a limited return and exchange policy.
          </p>
          <p>
            Thank you for shopping at TRENDY GLITTERZ. We inspect every piece carefully before dispatch to ensure the highest standards of quality.
          </p>
        </div>

        {/* Section 1: Eligible for Return/Exchange */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif tracking-tight border-b border-obsidian/10 pb-3 flex items-center gap-2">
            <span>🔄</span> Eligible for Return / Exchange
          </h2>
          <div className="space-y-4 text-sm font-sans leading-relaxed text-obsidian/80">
            <p>A return or exchange may be considered if:</p>
            <ul className="space-y-2 pl-4 list-disc list-inside">
              <li>You receive a wrong product.</li>
              <li>The product is damaged during transit.</li>
              <li>The product received has a manufacturing defect.</li>
            </ul>
            <p className="bg-obsidian/5 border-l-4 border-burgundy px-4 py-3 rounded-r-md">
              <span className="font-semibold text-obsidian">Important:</span> Customers must contact Trendy Glitterz within <span className="font-semibold text-burgundy">24 hours of delivery</span> to report an issue.
            </p>
          </div>
        </div>

        {/* Section 2: Non-Returnable Items */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif tracking-tight border-b border-obsidian/10 pb-3 flex items-center gap-2">
            <span>❌</span> Non-Returnable Items
          </h2>
          <div className="space-y-3 text-sm font-sans leading-relaxed text-obsidian/80">
            <p>Returns and exchanges are generally not accepted for:</p>
            <ul className="space-y-2 pl-4 list-disc list-inside">
              <li>Change of mind</li>
              <li>Wrong size selected by the customer</li>
              <li>Minor variations in colour due to lighting or screen settings</li>
              <li>Products showing signs of use, damage or alteration by the customer</li>
              <li>Items without their original packaging</li>
              <li>Sale, clearance or specially marked non-returnable products</li>
            </ul>
          </div>
        </div>

        {/* Section 3: Unboxing Video Requirement */}
        <div className="p-6 bg-burgundy/5 border border-burgundy/20 rounded-2xl space-y-4">
          <h2 className="text-lg font-serif tracking-tight text-obsidian flex items-center gap-2">
            <span>📹</span> Unboxing Video Requirement
          </h2>
          <div className="space-y-3 text-sm font-sans leading-relaxed text-obsidian/80">
            <p>
              For damaged, missing or incorrect items, customers are strongly requested to record a continuous unboxing video from the time the parcel is unopened until the product is fully revealed.
            </p>
            <p>
              The video may be required to verify the issue and process a return or exchange.
            </p>
            <p className="text-xs font-sans bg-white/70 border border-burgundy/20 p-3 rounded-lg text-burgundy font-medium">
              ⚠️ Claims without sufficient proof may not be accepted.
            </p>
          </div>
        </div>

        {/* Section 4: Exchange Process */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif tracking-tight border-b border-obsidian/10 pb-3 flex items-center gap-2">
            <span>🔁</span> Exchange Process
          </h2>
          <div className="space-y-3 text-sm font-sans leading-relaxed text-obsidian/80">
            <p>If your order is eligible for an exchange:</p>
            <ol className="space-y-2 pl-4 list-decimal list-inside">
              <li>Contact Trendy Glitterz within 24 hours of delivery.</li>
              <li>Share your order number, photographs/videos and details of the issue.</li>
              <li>Our team will review the request.</li>
              <li>If approved, instructions for returning the product will be provided.</li>
              <li>The replacement product will be dispatched after the returned item is received and verified.</li>
            </ol>
            <p className="bg-obsidian/5 border-l-4 border-dustyrose px-4 py-3 rounded-r-md mt-3">
              <span className="font-semibold text-obsidian">Note:</span> Exchange approval is subject to product availability.
            </p>
          </div>
        </div>

        {/* Section 5: Refund Policy */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif tracking-tight border-b border-obsidian/10 pb-3 flex items-center gap-2">
            <span>💳</span> Refund Policy
          </h2>
          <div className="space-y-3 text-sm font-sans leading-relaxed text-obsidian/80">
            <p>
              If a refund is approved, the refund will be processed after the returned product is received and inspected.
            </p>
            <p>
              Refunds, where applicable, will generally be made to the original payment method.
            </p>
            <p>
              Shipping charges may be non-refundable, except where the issue is due to an incorrect, defective or damaged product supplied by Trendy Glitterz.
            </p>
            <p className="bg-obsidian/5 border-l-4 border-dustyrose px-4 py-3 rounded-r-md">
              <span className="font-semibold text-obsidian">Processing Time:</span> The time taken for the refund to reflect in your account may depend on your bank or payment provider.
            </p>
          </div>
        </div>

        {/* Section 6: Cancellation Policy */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif tracking-tight border-b border-obsidian/10 pb-3 flex items-center gap-2">
            <span>❌</span> Cancellation Policy
          </h2>
          <div className="space-y-3 text-sm font-sans leading-relaxed text-obsidian/80">
            <p>
              Orders can be cancelled only before they are dispatched.
            </p>
            <p>
              Once an order has been shipped, cancellation may no longer be possible.
            </p>
            <p>
              To request a cancellation, please contact Trendy Glitterz as soon as possible with your order number.
            </p>
            <p className="bg-obsidian/5 border-l-4 border-dustyrose px-4 py-3 rounded-r-md">
              <span className="font-semibold text-obsidian">Note:</span> If an order has already been dispatched, the customer may need to receive the parcel and follow the applicable return/exchange policy.
            </p>
          </div>
        </div>

        {/* Section 7: Damaged or Missing Items */}
        <div className="p-6 bg-obsidian/5 border border-obsidian/10 rounded-2xl space-y-4">
          <h2 className="text-lg font-serif tracking-tight text-obsidian flex items-center gap-2">
            <span>📦</span> Damaged or Missing Items
          </h2>
          <div className="space-y-3 text-sm font-sans leading-relaxed text-obsidian/80">
            <p>If your parcel arrives damaged or an item appears to be missing:</p>
            <ul className="space-y-2 pl-4 list-disc list-inside">
              <li>Do not discard the packaging.</li>
              <li>Take clear photographs of the parcel and packaging.</li>
              <li>Record an unboxing video whenever possible.</li>
              <li>Contact Trendy Glitterz within 24 hours of delivery with your order details and supporting evidence.</li>
            </ul>
            <p className="text-xs font-sans bg-white/70 border border-obsidian/10 p-3 rounded-lg text-obsidian/90 mt-2">
              Our team will review the issue and assist you accordingly.
            </p>
          </div>
        </div>

        {/* Section 8: Customer Support */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif tracking-tight border-b border-obsidian/10 pb-3 flex items-center gap-2">
            <span>📞</span> Customer Support
          </h2>
          <div className="space-y-3 text-sm font-sans leading-relaxed text-obsidian/80">
            <p>
              For questions regarding shipping, returns, exchanges or cancellations, please contact Trendy Glitterz through our official customer-support channels:
            </p>
            <ul className="space-y-2 pl-4">
              <li>
                <span className="font-semibold text-obsidian">Email: </span>
                <a href="mailto:trendyglitterzz@gmail.com" className="text-dustyrose hover:underline">trendyglitterzz@gmail.com</a>
              </li>
              <li>
                <span className="font-semibold text-obsidian">WhatsApp: </span>
                <a 
                  href="https://wa.me/919884110778?text=Hi%20Trendy%20Glitterz!%20I'm%20reaching%20out%20for%20customer%20support." 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-dustyrose hover:underline"
                >
                  +91 9884110778
                </a>
              </li>
            </ul>
            <p className="bg-obsidian/5 border-l-4 border-dustyrose px-4 py-3 rounded-r-md mt-4">
              <span className="font-semibold text-obsidian">Tip:</span> Please keep your order number ready when contacting us so we can assist you quickly.
            </p>
          </div>
        </div>

        {/* Back link */}
        <div className="pt-8 border-t border-obsidian/10">
          <Link href="/" className="text-[10px] font-sans uppercase tracking-[0.2em] text-obsidian/50 hover:text-obsidian transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
