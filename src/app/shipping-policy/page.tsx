"use client";

import Link from "next/link";

export default function ShippingPolicy() {
  return (
    <main className="bg-alabaster text-obsidian min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-12 border-b border-obsidian/10 text-center">
        <p className="text-[10px] font-sans uppercase tracking-[0.3em] text-obsidian/40 mb-4">Delivery</p>
        <h1 className="text-4xl md:text-6xl font-serif tracking-tight text-obsidian">Shipping Policy</h1>
        <p className="mt-4 text-sm font-sans text-obsidian/50">Last updated: March 12, 2024</p>
      </section>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-16 space-y-12">
        {/* Intro */}
        <div className="space-y-4 text-sm font-sans leading-relaxed text-obsidian/80">
          <p>
            At TRENDY GLITTERZ, we strive to deliver your hand-crafted jewelry products in the quickest and safest manner possible. This Shipping Policy details our policies regarding processing and shipping rates.
          </p>
        </div>

        {/* Section 1 */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif tracking-tight border-b border-obsidian/10 pb-3">1. Order Processing & Delivery</h2>
          <div className="space-y-3 text-sm font-sans leading-relaxed text-obsidian/80">
            <ul className="space-y-2 pl-4 list-disc list-inside">
              <li>Orders are generally processed within 1–3 business days after successful payment.</li>
              <li>Delivery usually takes 3–7 business days after dispatch, depending on the destination and courier service.</li>
              <li>Remote locations may require additional delivery time.</li>
              <li>Tracking details will be shared once your order has been dispatched.</li>
              <li>Delays caused by courier services, weather conditions, strikes, natural events or circumstances beyond our control may occasionally occur.</li>
            </ul>
            <p className="bg-obsidian/5 border-l-4 border-dustyrose px-4 py-3 rounded-r-md mt-4">
              <span className="font-semibold text-obsidian">Note:</span> Please ensure that your name, phone number and complete delivery address are correct while placing your order.
            </p>
          </div>
        </div>

        {/* Section 2 */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif tracking-tight border-b border-obsidian/10 pb-3">2. Domestic Shipping Rates and Estimates</h2>
          <div className="space-y-3 text-sm font-sans leading-relaxed text-obsidian/80">
            <p>
              We currently offer delivery across selected locations in India through trusted courier partners. Shipping charges will be calculated and displayed at checkout.
            </p>
            
            <div className="overflow-hidden rounded-lg border border-obsidian/10 mt-4">
              <table className="w-full text-left text-sm font-sans">
                <thead className="bg-obsidian/5 border-b border-obsidian/10">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-obsidian">Delivery Location</th>
                    <th className="px-4 py-3 font-semibold text-obsidian">Shipping Charge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-obsidian/10">
                  <tr>
                    <td className="px-4 py-3">Chennai</td>
                    <td className="px-4 py-3 font-medium">₹50</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Tamil Nadu – Outside Chennai</td>
                    <td className="px-4 py-3 font-medium">₹80</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Kerala</td>
                    <td className="px-4 py-3 font-medium">₹100</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Bangalore</td>
                    <td className="px-4 py-3 font-medium">₹100</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">North India</td>
                    <td className="px-4 py-3 font-medium">₹150</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif tracking-tight border-b border-obsidian/10 pb-3">3. International Shipping</h2>
          <div className="space-y-3 text-sm font-sans leading-relaxed text-obsidian/80">
            <p>
              Currently, we only ship within India. We plan to expand our services globally in the near future. Keep an eye on our announcements or subscribe to our newsletter for updates!
            </p>
          </div>
        </div>

        {/* Section 4 */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif tracking-tight border-b border-obsidian/10 pb-3">4. Shipment Tracking</h2>
          <div className="space-y-3 text-sm font-sans leading-relaxed text-obsidian/80">
            <p>
              When your order has shipped, you will receive an email notification from us which will include a tracking number you can use to check its status. Please allow 24 hours for the tracking information to become active.
            </p>
          </div>
        </div>

        {/* Section 5 */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif tracking-tight border-b border-obsidian/10 pb-3">5. Customs, Duties, and Taxes</h2>
          <div className="space-y-3 text-sm font-sans leading-relaxed text-obsidian/80">
            <p>
              TRENDY GLITTERZ is not responsible for any customs and taxes applied to your order. All fees imposed during or after shipping are the responsibility of the customer (tariffs, taxes, etc.).
            </p>
          </div>
        </div>

        {/* Section 6 */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif tracking-tight border-b border-obsidian/10 pb-3">6. Damages and Lost Packages</h2>
          <div className="space-y-3 text-sm font-sans leading-relaxed text-obsidian/80">
            <p>
              TRENDY GLITTERZ is not liable for any products damaged or lost during shipping. If you received your order damaged, please contact the shipment carrier or our support team directly to file a claim.
            </p>
            <p>
              Please save all packaging material and damaged goods before filing a claim.
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
