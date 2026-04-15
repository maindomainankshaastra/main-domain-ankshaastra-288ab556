import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { ScrollText, Download, Check, ArrowRight, Star } from "lucide-react";

const reports = [
  {
    id: 1,
    title: "Birth Chart Analysis",
    description: "Complete Janam Kundli with detailed planetary positions and their effects on your life.",
    pages: "25+ Pages",
    delivery: "24 Hours",
    price: "₹999",
    originalPrice: "₹1,499",
    features: ["Planetary positions", "Dasha predictions", "Favorable periods", "Remedial measures"],
  },
  {
    id: 2,
    title: "Career Report",
    description: "In-depth analysis of your career potential, suitable professions, and growth periods.",
    pages: "20+ Pages",
    delivery: "24 Hours",
    price: "₹1,499",
    originalPrice: "₹1,999",
    features: ["Career strengths", "Best professions", "Business potential", "Timing for changes"],
  },
  {
    id: 3,
    title: "Marriage Compatibility",
    description: "Detailed Kundli matching with Guna Milan and compatibility analysis for couples.",
    pages: "30+ Pages",
    delivery: "48 Hours",
    price: "₹1,999",
    originalPrice: "₹2,499",
    features: ["Guna Milan (36 points)", "Mangal Dosha check", "Relationship dynamics", "Remedies if needed"],
  },
  {
    id: 4,
    title: "Yearly Predictions",
    description: "Month-by-month predictions for the coming year covering all aspects of life.",
    pages: "40+ Pages",
    delivery: "48 Hours",
    price: "₹2,499",
    originalPrice: "₹3,499",
    features: ["Monthly predictions", "Transit effects", "Lucky periods", "Precautionary months"],
  },
  {
    id: 5,
    title: "Health Report",
    description: "Astrological analysis of health tendencies and preventive guidance.",
    pages: "15+ Pages",
    delivery: "24 Hours",
    price: "₹999",
    originalPrice: "₹1,299",
    features: ["Health indicators", "Vulnerable periods", "Favorable treatments", "Wellness remedies"],
  },
  {
    id: 6,
    title: "Complete Life Report",
    description: "Comprehensive analysis covering all aspects of life - career, marriage, health, and wealth.",
    pages: "60+ Pages",
    delivery: "72 Hours",
    price: "₹4,999",
    originalPrice: "₹6,999",
    features: ["All life aspects", "10-year predictions", "Detailed remedies", "Priority support"],
  },
];

const ReportsPage = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-12 pb-16 gradient-hero">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-1 rounded-full bg-muted border border-border text-secondary text-sm mb-4">
              Astrology Reports
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6">
              Detailed <span className="text-gradient-gold">Predictions</span>
            </h1>
            <p className="font-elegant text-xl text-muted-foreground mb-8">
              Get comprehensive astrological reports prepared by expert Vedic astrologers, delivered to your inbox
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ScrollText className="w-5 h-5 text-secondary" />
                <span>Detailed Analysis</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Download className="w-5 h-5 text-secondary" />
                <span>PDF Download</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Star className="w-5 h-5 text-secondary" />
                <span>Expert Verified</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Reports Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-mystical p-8 group hover:border-primary/50 transition-all duration-500"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl gradient-cosmic flex items-center justify-center">
                    <ScrollText className="w-6 h-6 text-foreground" />
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gradient-gold">{report.price}</span>
                    <span className="block text-sm text-muted-foreground line-through">{report.originalPrice}</span>
                  </div>
                </div>

                <h3 className="font-display text-xl font-semibold text-foreground mb-3 group-hover:text-secondary transition-colors">
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
                      <Check className="w-4 h-4 text-secondary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  to={`/payment?service=${encodeURIComponent(report.title)}&amount=${report.id === 1 ? 999 : report.id === 2 ? 1499 : report.id === 3 ? 1999 : report.id === 4 ? 2499 : report.id === 5 ? 999 : 4999}`}
                  className="flex items-center justify-center gap-2 w-full btn-cosmic"
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
      <section className="py-16 bg-midnight">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Want to See a Sample Report?
            </h2>
            <p className="text-muted-foreground mb-8">
              Download our free sample report to understand the depth and quality of our astrological analysis.
            </p>
            <button className="btn-gold">
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