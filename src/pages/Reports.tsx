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
    description: "India's first love & life quality compatibility report. Ashtakoot, KP System, Manglik & Dasa analysis — delivered on WhatsApp in 24 hours.",
    pages: "Detailed PDF",
    delivery: "24 Hours",
    price: formatINR(pricing.pyaarShastra.price),
    originalPrice: formatINR(pricing.pyaarShastra.originalPrice),
    amount: pricing.pyaarShastra.price,
    link: "/reports/pyaar-shastra",
    features: ["Love & Life Compatibility", "Emotional + Financial Harmony", "Marriage Stability Insights", "Compatibility Timing Guidance"],
  },
  {
    id: 3,
    title: "Marriage Compatibility",
    description: "Detailed Kundli matching with Guna Milan and compatibility analysis for couples.",
    pages: "30+ Pages",
    delivery: "48 Hours",
    price: formatINR(pricing.reports.numerology),
    originalPrice: formatINR(pricing.reports.numerologyOriginal),
    amount: pricing.reports.numerology,
    link: `/payment?service=Marriage%20Compatibility&amount=${pricing.reports.numerology}`,
    features: ["Guna Milan (36 points)", "Mangal Dosha check", "Relationship dynamics", "Remedies if needed"],
  },
  {
    id: 4,
    title: "Yearly Predictions",
    description: "Month-by-month predictions for the coming year covering all aspects of life.",
    pages: "40+ Pages",
    delivery: "48 Hours",
    price: formatINR(pricing.reports.varshphal),
    originalPrice: formatINR(pricing.reports.kundaliSingleOriginal),
    amount: pricing.reports.varshphal,
    link: "/services/varshphal-report",
    features: ["Monthly predictions", "Transit effects", "Lucky periods", "Precautionary months"],
  },
];

const ReportsPage = () => {
  return (
    <Layout>
      <SEOHead title="Astrology Reports" description="Detailed Vedic astrology reports including birth chart, career, marriage compatibility, and yearly predictions by Himansshu Agarwal Ji." canonical="/reports" />
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
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-warm p-8 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-md">
                    <ScrollText className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gradient-primary">{report.price}</span>
                    <span className="block text-sm text-muted-foreground line-through">{report.originalPrice}</span>
                  </div>
                </div>

                <h3 className="font-display text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {report.title}
                </h3>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  {report.description}
                </p>

                <div className="flex gap-4 mb-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ScrollText className="w-4 h-4" />
                    {report.pages}
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    {report.delivery}
                  </span>
                </div>

                <ul className="space-y-2 mb-6">
                  {report.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  to={report.link}
                  className="flex items-center justify-center gap-2 w-full btn-primary"
                >
                  Order Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Report CTA */}
      <section className="relative overflow-hidden py-20 gradient-hero">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse,hsl(var(--amber)/0.15),transparent_70%)]" />
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative max-w-2xl mx-auto"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Want to See a Sample Report?
            </h2>
            <p className="text-primary-foreground/80 mb-8">
              Download our free sample report to understand the depth and quality of our astrological analysis.
            </p>
            <button className="btn-primary inline-flex items-center">
              <Download className="w-5 h-5 inline-block mr-2" />
              Download Sample Report
            </button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default ReportsPage;