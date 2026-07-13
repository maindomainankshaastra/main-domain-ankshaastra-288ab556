import Layout from "@/components/layout/Layout";

const TermsOfService = () => {
  return (
    <Layout>
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Effective Date: 1 January 2025</p>

          <div className="prose prose-sm md:prose-base max-w-none text-foreground/80 space-y-6">
            <h2 className="font-display text-xl font-semibold text-foreground mt-8">1. Acceptance of Terms</h2>
            <p>By accessing or using Ankshaastra services, you agree to be bound by these Terms of Service.</p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">2. Service Description</h2>
            <p>Ankshaastra provides numerology-based name correction reports and related consultation services. Our services are based on traditional numerology principles and are intended for guidance purposes only.</p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">3. Disclaimer</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Results and outcomes vary based on individual circumstances</li>
              <li>Numerology is a metaphysical practice, not a guaranteed science</li>
              <li>We do not guarantee specific life changes or results</li>
              <li>Our reports are for informational and guidance purposes only</li>
              <li>We are not responsible for decisions made based on our reports</li>
            </ul>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">4. Intellectual Property</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>All reports, content, and materials are the intellectual property of Ankshaastra</li>
              <li>Reports are for personal use only and may not be reproduced, shared, or resold</li>
              <li>Unauthorized distribution may result in legal action</li>
            </ul>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">5. User Responsibilities</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide accurate information (name, date of birth)</li>
              <li>Review all information before submitting orders</li>
              <li>Respect intellectual property rights</li>
              <li>Use services legally and ethically</li>
            </ul>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">6. Limitation of Liability</h2>
            <p>Ankshaastra shall not be liable for:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Any indirect, incidental, or consequential damages</li>
              <li>Decisions made based on our reports</li>
              <li>Technical issues, delivery delays, or service interruptions</li>
              <li>Third-party actions or website issues</li>
            </ul>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">7. Governing Law</h2>
            <p>These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in India.</p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">8. Contact Information</h2>
            <p>For questions about these Terms of Service:</p>
            <p className="font-semibold">Ankshaastra Occult Experts LLP</p>
            <p>Phone: <a href="tel:+919667305577" className="text-primary hover:underline">9667305577</a></p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default TermsOfService;
