import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { ScrollText, Download, ArrowRight, Star } from "lucide-react";
import { formatINR } from "@/config/pricing";
import { reportsCatalogListings } from "@/data/serviceRegistry";

const ReportsPage = () => {
  return (
    <Layout minimal>
      <SEOHead
        title="Numerology Reports"
        description="Varshphal and Pyaar Shaastra numerology reports by Himansshu Agarwal Ji — detailed PDF predictions delivered to your inbox."
        canonical="/reports"
      />

      <section className="relative overflow-hidden pt-16 pb-20 gradient-hero">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse,hsl(var(--amber)/0.18),transparent_70%)]" />
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-amber-light text-sm font-semibold mb-4 tracking-wider uppercase">
              Reports
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
              Detailed <span className="text-amber-light">Report Services</span>
            </h1>
            <p className="text-xl text-primary-foreground/80 mb-8">
              In-depth numerology and compatibility reports — separate from our consultation services
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-primary-foreground/80">
              <span className="flex items-center gap-2"><ScrollText className="w-5 h-5 text-amber-light" /> PDF Reports</span>
              <span className="flex items-center gap-2"><Download className="w-5 h-5 text-amber-light" /> Email Delivery</span>
              <span className="flex items-center gap-2"><Star className="w-5 h-5 text-amber-light" /> Expert Verified</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-cream">
        <div className="section-container">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {reportsCatalogListings.map((report, i) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border-2 border-primary/20 rounded-2xl p-8 hover:shadow-xl hover:border-primary/40 transition-all flex flex-col"
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Report</span>
                <h3 className="font-display text-2xl font-bold text-foreground mb-3">{report.title}</h3>
                <p className="text-muted-foreground text-sm mb-6 flex-grow">{report.description}</p>
                <p className="font-display text-3xl font-bold text-primary mb-6">{formatINR(report.price)}</p>
                <Link
                  to={report.route}
                  className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90"
                >
                  View Report <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-10 max-w-xl mx-auto">
            Looking for consultations, lucky numbers, or business numerology? Browse our{" "}
            <Link to="/services" className="text-primary font-semibold hover:underline">Services</Link> menu.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default ReportsPage;
