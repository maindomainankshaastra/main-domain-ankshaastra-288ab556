import Layout from "@/components/layout/Layout";

const RefundPolicy = () => {
  return (
    <Layout>
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Refund & Cancellation Policy</h1>
          <p className="text-muted-foreground mb-8">Effective Date: January 2025</p>

          <div className="prose prose-sm md:prose-base max-w-none text-foreground/80 space-y-6">
            <h2 className="font-display text-xl font-semibold text-foreground mt-8">1. No Refund Policy</h2>
            <p>We operate a strict <strong>NO REFUND</strong> policy for all products and services, including but not limited to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Name Correction Reports (Digital PDF)</li>
              <li>Personalized Numerology Analysis</li>
              <li>Any physical products purchased</li>
              <li>Name Check packages</li>
            </ul>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">2. Reason for No Refund Policy</h2>
            <p>Our services involve:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Personalized consultation and analysis specific to your details (name, date of birth)</li>
              <li>Hand-crafted reports prepared individually by our expert numerologist</li>
              <li>Intellectual property and expertise that cannot be "returned" once delivered</li>
              <li>Time and effort invested in creating customized solutions</li>
            </ul>
            <p>Once a report is generated or service is rendered, it cannot be reversed, returned, or resold. Therefore, no refunds will be issued under any circumstances.</p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">3. Cancellation Policy</h2>

            <h3 className="font-display text-lg font-medium text-foreground">Before Report Generation</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>If you wish to cancel your order, you must do so within <strong>2 hours</strong> of payment</li>
              <li>Contact us immediately at <a href="tel:+919667305577" className="text-primary hover:underline">966 730 5577</a> with your order details</li>
              <li>Cancellation is subject to verification that work has not yet begun</li>
              <li>If work has already commenced, cancellation will not be possible</li>
            </ul>

            <h3 className="font-display text-lg font-medium text-foreground">After Report Generation/Delivery</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Once the report is prepared or delivered, cancellation is not possible</li>
              <li>No refunds will be issued after the report is sent to your email</li>
            </ul>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">4. Wrong Information Provided</h2>
            <p>If you provide incorrect details (name, date of birth, email, etc.), we are not responsible for inaccurate reports. No refunds or revisions will be provided for errors made by the customer. Please double-check all information before submitting your order.</p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">5. Payment Issues</h2>
            <p>In case of payment failure or technical errors where money is debited but order is not confirmed:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Contact us immediately at <a href="tel:+919667305577" className="text-primary hover:underline">9667305577</a></li>
              <li>Provide transaction details and payment proof</li>
              <li>We will verify with our payment gateway and resolve within 7–10 business days</li>
              <li>Refunds for genuine payment errors will be processed to the original payment method</li>
            </ul>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">6. Disputes</h2>
            <p>All sales are final. By purchasing our services, you acknowledge and agree to this No Refund Policy. Any disputes will be subject to the jurisdiction of courts in India.</p>

            <h2 className="font-display text-xl font-semibold text-foreground mt-8">7. Contact for Queries</h2>
            <p>If you have questions about this policy before purchasing:</p>
            <p className="font-semibold">Ankshaastra Occult Experts LLP</p>
            <p>Phone: <a href="tel:+919667305577" className="text-primary hover:underline">9667305577</a></p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default RefundPolicy;
