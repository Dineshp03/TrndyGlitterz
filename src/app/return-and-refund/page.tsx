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
          <p>
            Thank you for shopping at TRENDY GLITTERZ. We hope you love your purchase, but if you are not entirely satisfied, we are here to help.
          </p>
        </div>

        {/* Section 1 */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif tracking-tight border-b border-obsidian/10 pb-3">1. Return Window</h2>
          <div className="space-y-3 text-sm font-sans leading-relaxed text-obsidian/80">
            <p>
              You have <span className="font-semibold text-obsidian">7 calendar days</span> to return an item from the date you received it. To be eligible for a return, your item must be unused and in the same condition that you received it.
            </p>
          </div>
        </div>

        {/* Section 2 */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif tracking-tight border-b border-obsidian/10 pb-3">2. Return Conditions</h2>
          <div className="space-y-3 text-sm font-sans leading-relaxed text-obsidian/80">
            <p>To ensure a successful return, please verify the following conditions are met:</p>
            <ul className="space-y-2 pl-4 list-disc list-inside">
              <li>The item must be in its original packaging (box, pouch, certificate).</li>
              <li>The product must not show any signs of wear, usage, or damage.</li>
              <li>You need to have the receipt or proof of purchase.</li>
              <li>Gift cards and sale/promotional items are non-returnable.</li>
            </ul>
          </div>
        </div>

        {/* Section 3 */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif tracking-tight border-b border-obsidian/10 pb-3">3. Refund Process</h2>
          <div className="space-y-3 text-sm font-sans leading-relaxed text-obsidian/80">
            <p>
              Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item.
            </p>
            <p>
              If your return is approved, we will initiate a refund to your original method of payment (via Razorpay). You will receive the credit within 5-7 business days, depending on your card issuer&apos;s policies or bank processing times.
            </p>
          </div>
        </div>

        {/* Section 4 */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif tracking-tight border-b border-obsidian/10 pb-3">4. Shipping Fees for Returns</h2>
          <div className="space-y-3 text-sm font-sans leading-relaxed text-obsidian/80">
            <p>
              You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund (if we arrange the pickup).
            </p>
          </div>
        </div>

        {/* Section 5 */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif tracking-tight border-b border-obsidian/10 pb-3">5. Exchange Policy</h2>
          <div className="space-y-3 text-sm font-sans leading-relaxed text-obsidian/80">
            <p>
              We only replace items if they are defective or damaged. If you need to exchange it for the same item, send us an email at <a href="mailto:trendyglitterzz@gmail.com" className="text-dustyrose hover:underline">trendyglitterzz@gmail.com</a> or message us on WhatsApp with photos of the damage.
            </p>
          </div>
        </div>

        {/* Section 6 */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif tracking-tight border-b border-obsidian/10 pb-3">6. Contact Us</h2>
          <div className="space-y-3 text-sm font-sans leading-relaxed text-obsidian/80">
            <p>
              If you have any questions on how to return your item to us, contact us at:
            </p>
            <ul className="space-y-2 pl-4">
              <li>
                <span className="font-semibold text-obsidian">Email: </span>
                <a href="mailto:trendyglitterzz@gmail.com" className="text-dustyrose hover:underline">trendyglitterzz@gmail.com</a>
              </li>
              <li>
                <span className="font-semibold text-obsidian">WhatsApp: </span>
                <a 
                  href="https://wa.me/919884110778?text=Hi%20Trendy%20Glitterz!%20I'm%20reaching%20out%20regarding%20a%20return%2Frefund." 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-dustyrose hover:underline"
                >
                  +91 9884110778
                </a>
              </li>
            </ul>
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
