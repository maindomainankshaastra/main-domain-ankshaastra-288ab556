import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { ArrowRight, CheckCircle } from "lucide-react";
import { formatINR, payLink } from "@/config/pricing";
import type { ServiceHub } from "@/data/serviceCatalog";

type Props = {
  hub: ServiceHub;
  features?: string[];
};

export default function ServiceHubPage({ hub, features = [] }: Props) {
  return (
    <Layout>
      <SEOHead title={hub.title} description={hub.subtitle} canonical={hub.canonical} />

      <section className="relative py-16 md:py-24 bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <span className="inline-block mb-4 text-sm font-medium text-primary uppercase tracking-wider">{hub.category}</span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4"
          >
            {hub.title}
          </motion.h1>
          <p className="text-lg text-muted-foreground leading-relaxed">{hub.subtitle}</p>
        </div>
      </section>

      {features.length > 0 && (
        <section className="py-10 container mx-auto px-4 max-w-4xl">
          <ul className="grid md:grid-cols-2 gap-3">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm md:text-base">
                <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-10">Choose Your Package</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {hub.packages.map((pkg) => {
              const href = pkg.externalUrl || payLink(pkg.serviceTitle, pkg.price, pkg.formType);
              const external = Boolean(pkg.externalUrl);
              const inner = (
                <div
                  className={`rounded-2xl border p-6 bg-card flex flex-col h-full ${
                    pkg.popular ? "border-primary shadow-lg ring-1 ring-primary/20" : "border-border"
                  }`}
                >
                  {pkg.tag && <span className="text-xs font-semibold text-primary uppercase mb-2">{pkg.tag}</span>}
                  <h3 className="font-display text-xl font-bold">{pkg.name}</h3>
                  {pkg.description && <p className="text-sm text-muted-foreground mt-2 mb-4">{pkg.description}</p>}
                  <div className="mb-6 mt-auto pt-4">
                    <span className="text-2xl font-bold">{formatINR(pkg.price)}</span>
                    {pkg.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through ml-2">{formatINR(pkg.originalPrice)}</span>
                    )}
                  </div>
                  <span className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold">
                    Book Now <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              );

              return external ? (
                <a key={pkg.name} href={href} target="_blank" rel="noopener noreferrer" className="block h-full">
                  {inner}
                </a>
              ) : (
                <Link key={pkg.name} to={href} className="block h-full">
                  {inner}
                </Link>
              );
            })}
          </div>

          {hub.hubAddons && hub.hubAddons.length > 0 && (
            <div className="max-w-3xl mx-auto mt-12 rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold mb-3">Available Add-Ons at Checkout</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {hub.hubAddons.map((a) => (
                  <li key={a.label} className="flex justify-between gap-4">
                    <span>{a.label}</span>
                    <span className="font-semibold text-foreground">{formatINR(a.price)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
