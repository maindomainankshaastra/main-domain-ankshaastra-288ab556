import Layout from "@/components/layout/Layout";

const PrivacyPolicy = () => {
  return (
    <Layout>
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Effective Date: 1 January 2025</p>

          <div className="prose prose-sm md:prose-base max-w-none text-foreground/80 space-y-6">
            <p>We ("we," "us," "our") are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.</p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">1. Information We Collect</h2>

            <h3 className="font-display text-lg font-medium text-foreground">Personal Information You Provide</h3>
            <p>When you purchase our services, we collect:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Full name (as per Aadhar Card or official ID)</li>
              <li>Date of birth</li>
              <li>Mobile number</li>
              <li>Email address</li>
              <li>Any additional information you provide in consultation</li>
            </ul>

            <h3 className="font-display text-lg font-medium text-foreground">Automatically Collected Information</h3>
            <p>When you visit our website, we may collect:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>Pages visited and time spent</li>
              <li>Referring website addresses</li>
            </ul>

            <h3 className="font-display text-lg font-medium text-foreground">Payment Information</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Payment details are processed through secure third-party payment gateways</li>
              <li>We do not store your credit card, debit card, or banking information</li>
              <li>Payment processing is handled by our payment partners (Razorpay/Instamojo/etc.)</li>
            </ul>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">2. How We Use Your Information</h2>
            <p>We use your personal information to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Prepare your personalized numerology report based on your name and date of birth</li>
              <li>Deliver reports to your email address</li>
              <li>Communicate with you regarding your order, queries, or follow-ups</li>
              <li>Improve our services through analysis of user patterns (anonymized)</li>
              <li>Send promotional offers (only if you have opted in — you can unsubscribe anytime)</li>
              <li>Comply with legal obligations if required by law</li>
            </ul>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">3. How We Share Your Information</h2>
            <p>We DO NOT sell, rent, or trade your personal information to third parties.</p>
            <p>We may share your information only in the following circumstances:</p>

            <h3 className="font-display text-lg font-medium text-foreground">Service Providers</h3>
            <p>With trusted partners who help us deliver services (email providers, payment gateways, hosting services) — they are bound by confidentiality agreements.</p>

            <h3 className="font-display text-lg font-medium text-foreground">Legal Requirements</h3>
            <p>If required by law, court order, or government authority.</p>

            <h3 className="font-display text-lg font-medium text-foreground">Business Transfers</h3>
            <p>In the event of a merger, acquisition, or sale of assets (users will be notified).</p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">4. Data Security</h2>
            <p>We implement appropriate security measures to protect your personal information:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Secure SSL encryption for data transmission</li>
              <li>Restricted access to personal data (only authorized personnel)</li>
              <li>Regular security audits and updates</li>
              <li>Password-protected systems</li>
            </ul>
            <p>However, no method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.</p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">5. Data Retention</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>We retain your personal information for as long as necessary to provide services and comply with legal obligations.</li>
              <li>Digital reports and personal data are stored securely for a minimum of 1 year after delivery.</li>
              <li>You may request deletion of your data by contacting us (subject to legal requirements).</li>
            </ul>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access your personal information we hold.</li>
              <li>Correct inaccurate or incomplete information.</li>
              <li>Request deletion of your data (subject to legal and business requirements).</li>
              <li>Opt-out of promotional communications at any time.</li>
              <li>Withdraw consent for data processing (may affect service delivery).</li>
            </ul>
            <p>To exercise these rights, contact us at <a href="tel:+919667305577" className="text-primary hover:underline">966 730 5577</a>.</p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">7. Cookies and Tracking</h2>
            <p>Our website may use cookies to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Remember your preferences.</li>
              <li>Analyze website traffic and user behavior.</li>
              <li>Improve user experience.</li>
            </ul>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">8. Third-Party Links</h2>
            <p>Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. Please review their privacy policies before providing any information.</p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">9. Children's Privacy</h2>
            <p>Our services are intended for individuals under 18 years of age also. We do not knowingly collect personal information from children. If you believe we have collected data from a minor, please contact us immediately.</p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">10. International Users</h2>
            <p>Our services are primarily offered in India. If you access our services from outside India, you consent to the transfer and processing of your data in India.</p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">11. Changes to Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically.</p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">12. Contact Us</h2>
            <p>For privacy-related questions or concerns:</p>
            <p className="font-semibold">Ankshaastra Occult Experts LLP</p>
            <p>Phone: <a href="tel:+919667305577" className="text-primary hover:underline">9667305577</a></p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PrivacyPolicy;
