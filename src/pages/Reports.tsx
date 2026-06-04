import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { ScrollText, Download, Check, ArrowRight, Star } from "lucide-react";
import { pricing, formatINR } from "@/config/pricing";

const reports = [
  {
    id: 1,
    title: "Pyaar Shaastra Report",
    description: "India's first love & life quality compatibility report. Ashtakoot, KP System, Manglik & Dasa analysis — delivered on email in 9 hours.",
    pages: "Detailed PDF",
    delivery: "9 Hours",
    price: formatINR(pricing.pyaarShastra.price),
    originalPrice: formatINR(pricing.pyaarShastra.originalPrice),
    amount: pricing.pyaarShastra.price,
    link: "/reports/pyaar-shastra",
    features: ["Love & Life Compatibility", "Emotional + Financial Harmony", "Marriage Stability Insights", "Compatibility Timing Guidance"],
  },
  {
    id: 2,
    title: "Premium Personalised Kundli 2.0",
    description: "Single, double, or triple personalized kundli reports covering career, marriage, wealth, and remedies.",
    pages: "Detailed PDF",
    delivery: "9 Hours",
    price: formatINR(pricing.reports.kundaliSingle),
    originalPrice: formatINR(pricing.reports.kundaliSingleOriginal),
    amount: pricing.reports.kundaliSingle,
    link: "/reports/personalized-kundali",
    features: ["Birth chart analysis", "Dasha predictions", "Career & marriage insights", "Personalized remedies"],
  },
  {
    id: 3,
    title: "Varshphal Report 2026",
    description: "Month-by-month predictions for 2026 covering career, health, relationships, and finances.",
    pages: "40+ Pages",
    delivery: "48 Hours",
    price: formatINR(pricing.reports.varshphal),
    amount: pricing.reports.varshphal,
    link: "/services/varshphal-report",
    features: ["Monthly predictions", "Lucky numbers & colors", "Career & business timing", "Remedial suggestions"],
  },
];

const ReportsPage = () => {
  return (
    <Layout>
      <SEOHead title="Astrology Reports" description="Detailed Vedic astrology reports including personalized kundli, Pyaar Shaastra, and Varshphal by Himansshu Agarwal Ji." canonical="/reports" />
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 gradient-hero">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse,hsl(var(--amber)/0.18),transparent_70%)]" />
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-amber-light text-sm font-semibold mb-4 tracking-wider uppercase">
              Astrology Reports
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
              Detailed <span className="text-amber-light">Predictions</span>
            </h1>
            <p className="text-xl text-primary-foreground/80 mb-8">
              Get comprehensive astrological reports prepared by expert Vedic astrologers, delivered to your inbox
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-2 text-primary-foreground/80">
                <ScrollText className="w-5 h-5 text-amber-light" />
                <span>Detailed Analysis</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/80">
                <Download className="w-5 h-5 text-amber-light" />
                <span>PDF Download</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/80">
                <Star className="w-5 h-5 text-amber-light" />
                <span>Expert Verified</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Reports Grid */}
      <section className="section-padding">
        <div className="section-container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reports.map((report, i) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg hover:border-primary/30 transition-all flex flex-col"
              >
                <h3 className="font-display text-2xl font-bold text-foreground mb-3">{report.title}</h3>
                <p className="text-muted-foreground text-sm mb-6 flex-grow">{report.description}</p>
                <ul className="space-y-2 mb-6">
                  {report.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="font-display text-3xl font-bold text-primary">{report.price}</span>
                  {report.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">{report.originalPrice}</span>
                  )}
                </div>
                <Link
                  to={report.link}
                  className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
                >
                  View Report <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ReportsPage;
