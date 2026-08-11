"use client";

import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <main className="bg-alabaster text-obsidian min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-12 border-b border-obsidian/10 text-center">
        <p className="text-[10px] font-sans uppercase tracking-[0.3em] text-obsidian/40 mb-4">Legal</p>
        <h1 className="text-4xl md:text-6xl font-serif tracking-tight text-obsidian">Privacy Policy</h1>
        <p className="mt-4 text-sm font-sans text-obsidian/50">Last updated: March 12, 2024</p>
      </section>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-16 space-y-12">

        {/* Intro */}
        <div className="space-y-4 text-sm font-sans leading-relaxed text-obsidian/80">
          <p>
            This Privacy Policy describes Our policies and procedures on the collection, use, and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.
          </p>
          <p>
            We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.
          </p>
        </div>

        {/* Order Processing & Delivery Notice */}
        <div className="p-6 bg-obsidian/5 border border-obsidian/10 rounded-2xl space-y-4">
          <h2 className="text-lg font-serif tracking-tight text-obsidian flex items-center gap-2">
            <span>📦</span> Order Processing &amp; Delivery
          </h2>
          <ul className="space-y-2 text-sm font-sans leading-relaxed text-obsidian/80 list-disc list-inside pl-2">
            <li>Orders are generally processed within 1–3 business days after successful payment.</li>
            <li>Delivery usually takes 3–7 business days after dispatch, depending on the destination and courier service.</li>
            <li>Remote locations may require additional delivery time.</li>
            <li>Tracking details will be shared once your order has been dispatched.</li>
            <li>Delays caused by courier services, weather conditions, strikes, natural events or circumstances beyond our control may occasionally occur.</li>
          </ul>
          <p className="text-xs font-sans bg-white/60 border border-obsidian/10 p-3 rounded-lg text-obsidian/90">
            <span className="font-semibold text-obsidian">Note:</span> Please ensure that your name, phone number and complete delivery address are correct while placing your order.
          </p>
        </div>

        {/* Section 1 */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif tracking-tight border-b border-obsidian/10 pb-3">1. Interpretation and Definitions</h2>
          <div className="space-y-3 text-sm font-sans leading-relaxed text-obsidian/80">
            <h3 className="font-semibold text-obsidian text-base">Interpretation</h3>
            <p>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
            <h3 className="font-semibold text-obsidian text-base pt-2">Definitions</h3>
            <ul className="space-y-3 pl-4">
              <li><span className="font-semibold text-obsidian">Account:</span> A unique account created for You to access our Service or parts of our Service.</li>
              <li><span className="font-semibold text-obsidian">Affiliate:</span> An entity that controls, is controlled by or is under common control with a party, where &ldquo;control&rdquo; means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</li>
              <li><span className="font-semibold text-obsidian">Company:</span> (referred to as either &ldquo;the Company&rdquo;, &ldquo;We&rdquo;, &ldquo;Us&rdquo; or &ldquo;Our&rdquo; in this Agreement) refers to TRENDY GLITTERZ.</li>
              <li><span className="font-semibold text-obsidian">Cookies:</span> Small files that are placed on Your computer, mobile device or any other device by a website, containing the details of Your browsing history on that website among its many uses.</li>
              <li><span className="font-semibold text-obsidian">Country:</span> Refers to Tamil Nadu, India.</li>
              <li><span className="font-semibold text-obsidian">Device:</span> Any device that can access the Service such as a computer, a cellphone or a digital tablet.</li>
              <li><span className="font-semibold text-obsidian">Personal Data:</span> Any information that relates to an identified or identifiable individual.</li>
              <li><span className="font-semibold text-obsidian">Service:</span> Refers to the Website.</li>
              <li><span className="font-semibold text-obsidian">Service Provider:</span> Any natural or legal person who processes the data on behalf of the Company. It refers to third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.</li>
              <li><span className="font-semibold text-obsidian">Usage Data:</span> Data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).</li>
              <li><span className="font-semibold text-obsidian">Website:</span> Refers to TRENDY GLITTERZ, accessible from <a href="https://www.trendyglitterz.com/" className="text-dustyrose hover:underline">https://www.trendyglitterz.com/</a></li>
              <li><span className="font-semibold text-obsidian">You:</span> The individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</li>
            </ul>
          </div>
        </div>

        {/* Section 2 */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif tracking-tight border-b border-obsidian/10 pb-3">2. Collecting and Using Your Personal Data</h2>
          <div className="space-y-3 text-sm font-sans leading-relaxed text-obsidian/80">
            <h3 className="font-semibold text-obsidian text-base">Types of Data Collected</h3>
            <h4 className="font-semibold text-obsidian">Personal Data</h4>
            <p>While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact, identify You, and fulfill your orders. Personally identifiable information may include, but is not limited to:</p>
            <ul className="space-y-1 pl-4 list-disc list-inside">
              <li>Email address</li>
              <li>First name and last name</li>
              <li>Phone number</li>
              <li>Shipping and Billing Address, State, Province, ZIP/Postal code, City</li>
              <li>Usage Data</li>
            </ul>
            <h4 className="font-semibold text-obsidian pt-2">Usage Data</h4>
            <p>Usage Data is collected automatically when using the Service. Usage Data may include information such as Your Device&apos;s Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</p>
            <p>When You access the Service by or through a mobile device, We may collect certain information automatically, including, but not limited to, the type of mobile device You use, Your mobile device unique ID, the IP address of Your mobile device, Your mobile operating system, the type of mobile Internet browser You use, unique device identifiers and other diagnostic data.</p>
          </div>
        </div>

        {/* Section 3 */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif tracking-tight border-b border-obsidian/10 pb-3">3. Tracking Technologies and Cookies</h2>
          <div className="space-y-3 text-sm font-sans leading-relaxed text-obsidian/80">
            <p>We use Cookies and similar tracking technologies to track the activity on Our Service and store certain information. Tracking technologies used are beacons, tags, and scripts to collect and track information and to improve and analyze Our Service. The technologies We use may include:</p>
            <ul className="space-y-3 pl-4">
              <li><span className="font-semibold text-obsidian">Cookies or Browser Cookies:</span> A cookie is a small file placed on Your Device. You can instruct Your browser to refuse all Cookies or to indicate when a Cookie is being sent. However, if You do not accept Cookies, You may not be able to use some parts of our Service.</li>
              <li><span className="font-semibold text-obsidian">Web Beacons:</span> Certain sections of our Service and our emails may contain small electronic files known as web beacons (also referred to as clear gifs, pixel tags, and single-pixel gifs) that permit the Company, for example, to count users who have visited those pages or opened an email and for other related website statistics.</li>
            </ul>
            <p className="pt-2">We use both Session and Persistent Cookies for the purposes set out below:</p>
            <ul className="space-y-3 pl-4">
              <li><span className="font-semibold text-obsidian">Necessary / Essential Cookies (Session):</span> Essential to provide You with services available through the Website, enable features like the shopping cart, authenticate users, and prevent fraudulent use of user accounts.</li>
              <li><span className="font-semibold text-obsidian">Cookies Policy / Notice Acceptance Cookies (Persistent):</span> Identify if users have accepted the use of cookies on the Website.</li>
              <li><span className="font-semibold text-obsidian">Functionality Cookies (Persistent):</span> Allow us to remember choices You make when You use the Website, such as remembering your login details or language preference to provide a more personal experience.</li>
            </ul>
          </div>
        </div>

        {/* Section 4 */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif tracking-tight border-b border-obsidian/10 pb-3">4. Use of Your Personal Data</h2>
          <div className="space-y-3 text-sm font-sans leading-relaxed text-obsidian/80">
            <p>The Company may use Personal Data for the following purposes:</p>
            <ul className="space-y-3 pl-4">
              <li><span className="font-semibold text-obsidian">To provide and maintain our Service:</span> Including to monitor the usage of our Service.</li>
              <li><span className="font-semibold text-obsidian">To manage Your Account:</span> To manage Your registration as a user of the Service.</li>
              <li><span className="font-semibold text-obsidian">For the performance of a contract:</span> The development, compliance, and undertaking of the purchase contract for the products, items, or services You have purchased.</li>
              <li><span className="font-semibold text-obsidian">To contact You:</span> By email, telephone calls, SMS, or other equivalent forms of electronic communication regarding order updates, informative communications related to products, or security updates.</li>
              <li><span className="font-semibold text-obsidian">To provide You with news and special offers:</span> General information about other goods, services, and events which we offer that are similar to those that you have already purchased or enquired about, unless You have opted not to receive such information.</li>
              <li><span className="font-semibold text-obsidian">To manage Your requests:</span> To attend and manage Your requests and support tickets.</li>
              <li><span className="font-semibold text-obsidian">For business transfers:</span> To evaluate or conduct a merger, divestiture, restructuring, or other sale or transfer of some or all of Our assets.</li>
              <li><span className="font-semibold text-obsidian">For other purposes:</span> Data analysis, identifying usage trends, determining the effectiveness of our promotional campaigns, and evaluating and improving our platform.</li>
            </ul>
            <h3 className="font-semibold text-obsidian text-base pt-4">Sharing Your Personal Information</h3>
            <p>We may share Your personal information in the following situations:</p>
            <ul className="space-y-3 pl-4">
              <li><span className="font-semibold text-obsidian">With Service Providers:</span> To monitor and analyze the use of our Service, process payments, handle shipping/logistics, and contact You.</li>
              <li><span className="font-semibold text-obsidian">For business transfers:</span> During negotiations of any merger, sale of Company assets, financing, or acquisition.</li>
              <li><span className="font-semibold text-obsidian">With Affiliates:</span> We will require those affiliates to honor this Privacy Policy.</li>
              <li><span className="font-semibold text-obsidian">With business partners:</span> To offer You certain products, services or promotions.</li>
              <li><span className="font-semibold text-obsidian">With Your consent:</span> We may disclose Your personal information for any other purpose with Your consent.</li>
            </ul>
          </div>
        </div>

        {/* Section 5 */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif tracking-tight border-b border-obsidian/10 pb-3">5. Retention &amp; Transfer of Your Personal Data</h2>
          <div className="space-y-3 text-sm font-sans leading-relaxed text-obsidian/80">
            <p>The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy to comply with our legal obligations, resolve disputes, and enforce our legal agreements.</p>
            <p>Your information, including Personal Data, is processed at the Company&apos;s operating offices and in any other places where the parties involved in the processing are located. Your consent to this Privacy Policy followed by Your submission of such information represents Your agreement to that transfer. We will take all steps reasonably necessary to ensure that Your data is treated securely.</p>
          </div>
        </div>

        {/* Section 6 */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif tracking-tight border-b border-obsidian/10 pb-3">6. Delete Your Personal Data</h2>
          <div className="space-y-3 text-sm font-sans leading-relaxed text-obsidian/80">
            <p>You have the right to delete or request that We assist in deleting the Personal Data that We have collected about You. You may update, amend, or delete Your information at any time by signing in to Your Account settings. You may also contact Us to request access to, correct, or delete any personal information that You have provided to Us.</p>
            <p className="bg-obsidian/5 border-l-4 border-dustyrose px-4 py-3 rounded-r-md">
              <span className="font-semibold text-obsidian">Note:</span> We may need to retain certain information when we have a legal obligation or lawful basis to do so (e.g., keeping transaction records for tax and accounting purposes).
            </p>
          </div>
        </div>

        {/* Section 7 */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif tracking-tight border-b border-obsidian/10 pb-3">7. Disclosure of Your Personal Data</h2>
          <div className="space-y-3 text-sm font-sans leading-relaxed text-obsidian/80">
            <ul className="space-y-3 pl-4">
              <li><span className="font-semibold text-obsidian">Business Transactions:</span> If the Company is involved in a merger, acquisition or asset sale, Your Personal Data may be transferred with prior notice.</li>
              <li><span className="font-semibold text-obsidian">Law enforcement:</span> We may be required to disclose Your Personal Data if required to do so by law or in response to valid requests by public authorities.</li>
              <li><span className="font-semibold text-obsidian">Other legal requirements:</span> The Company may disclose Your Personal Data in the good faith belief that such action is necessary to comply with a legal obligation, protect and defend the rights or property of the Company, or protect the personal safety of Users.</li>
            </ul>
          </div>
        </div>

        {/* Section 8 */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif tracking-tight border-b border-obsidian/10 pb-3">8. Security &amp; Children&apos;s Privacy</h2>
          <div className="space-y-3 text-sm font-sans leading-relaxed text-obsidian/80">
            <h3 className="font-semibold text-obsidian text-base">Security</h3>
            <p>The security of Your Personal Data is important to Us. While We strive to use commercially acceptable means to protect Your Personal Data (including secure checkout processes), We cannot guarantee its absolute security over the Internet.</p>
            <h3 className="font-semibold text-obsidian text-base pt-2">Children&apos;s Privacy</h3>
            <p>Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. If You are a parent or guardian and You are aware that Your child has provided Us with Personal Data, please contact Us so we can remove that information from Our servers.</p>
          </div>
        </div>

        {/* Section 9 */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif tracking-tight border-b border-obsidian/10 pb-3">9. Links to Other Websites</h2>
          <div className="space-y-3 text-sm font-sans leading-relaxed text-obsidian/80">
            <p>Our Service may contain links to other websites that are not operated by Us. If You click on a third-party link, You will be directed to that third party&apos;s site. We strongly advise You to review the Privacy Policy of every site You visit. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.</p>
          </div>
        </div>

        {/* Section 10 */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif tracking-tight border-b border-obsidian/10 pb-3">10. Changes to this Privacy Policy</h2>
          <div className="space-y-3 text-sm font-sans leading-relaxed text-obsidian/80">
            <p>We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page and updating the &ldquo;Last updated&rdquo; date. You are advised to review this Privacy Policy periodically.</p>
          </div>
        </div>

        {/* Section 11 */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif tracking-tight border-b border-obsidian/10 pb-3">11. Contact Us</h2>
          <div className="space-y-3 text-sm font-sans leading-relaxed text-obsidian/80">
            <p>If you have any questions about this Privacy Policy, You can contact us:</p>
            <ul className="space-y-2 pl-4">
              <li>
                <span className="font-semibold text-obsidian">Email: </span>
                <a href="mailto:trendyglitterzz@gmail.com" className="text-dustyrose hover:underline">trendyglitterzz@gmail.com</a>
              </li>
              <li>
                <span className="font-semibold text-obsidian">Website: </span>
                <a href="https://www.trendyglitterz.com/" className="text-dustyrose hover:underline">https://www.trendyglitterz.com/</a>
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
