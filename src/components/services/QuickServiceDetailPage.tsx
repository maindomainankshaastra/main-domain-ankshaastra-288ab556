import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { ArrowRight, CheckCircle, Clock, Shield } from "lucide-react";
import { formatINR, payLink } from "@/config/pricing";
import type { StandaloneService } from "@/data/standaloneServices";

type Props = {
  service: StandaloneService;
};

export default function QuickServiceDetailPage({ service }: Props) {
  const checkoutUrl = payLink(service.serviceTitle, service.price, service.formType);
  const Icon = service.icon;

  return (
    <Layout>
      <SEOHead
        title={service.seoTitle}
        description={service.seoDescription}
        canonical={service.route}
      />

      <section className="relative py-16 md:py-24 bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <span className="inline-block mb-4 text-sm font-medium text-primary uppercase tracking-wider">
            {service.category}
          </span>
          {Icon && (
            <div className="w-16 h-16 rounded-full border-2 border-primary/30 flex items-center justify-center mx-auto mb-5">
              <Icon className="w-8 h-8 text-primary" strokeWidth={1.5} />
            </div>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4"
          >
            {service.title}
          </motion.h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">{service.subtitle}</p>
          <p className="font-display text-4xl font-bold text-primary mb-8">{formatINR(service.price)}</p>
          <Link
            to={checkoutUrl}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-4 rounded-xl hover:opacity-90 transition-opacity"
          >
            Order Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <section className="py-12 container mx-auto px-4 max-w-4xl">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-8">Quick Summary</h2>
        <ul className="grid md:grid-cols-2 gap-4">
          {service.quickSummary.map((item) => (
            <li key={item} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
              <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm md:text-base text-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-2xl font-bold text-center mb-6">About This Service</h2>
          <p className="text-muted-foreground text-center leading-relaxed mb-8">{service.description}</p>
          <ul className="space-y-3">
            {service.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16 container mx-auto px-4 max-w-xl text-center">
        <div className="rounded-2xl border-2 border-primary bg-card p-8 shadow-lg">
          <h3 className="font-display text-2xl font-bold mb-2">{service.title}</h3>
          <p className="text-3xl font-bold text-primary mb-6">{formatINR(service.price)}</p>
          <Link
            to={checkoutUrl}
            className="block w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:opacity-90"
          >
            Complete Order Form
          </Link>
          <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Fast delivery</span>
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Confidential</span>
          </div>
        </div>
      </section>
    </Layout>
  );
};
