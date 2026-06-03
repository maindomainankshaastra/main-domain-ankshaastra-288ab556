import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { ArrowRight, CheckCircle, ChevronDown } from "lucide-react";
import { formatINR } from "@/config/pricing";

type ServicePageData = {
  slug: string;
  route: string;
  page_type: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  category: string | null;
  seo_title: string | null;
  seo_description: string | null;
  form_type: string;
  content: {
    features?: string[];
    faqs?: { q: string; a: string }[];
  };
};

type ServicePackageData = {
  id: string;
  name: string;
  tag: string | null;
  description: string | null;
  price: number;
  original_price: number | null;
  form_type: string | null;
  payment_service_title: string | null;
  features: string[];
  is_popular: boolean;
};

const buildPaymentUrl = (page: ServicePageData, pkg: ServicePackageData) => {
  const params = new URLSearchParams({
    service: pkg.payment_service_title || pkg.name,
    amount: String(pkg.price),
    formType: pkg.form_type || page.form_type || "default",
  });
  return `/payment?${params.toString()}`;
};

function ServicePageSkeleton({ slug }: { slug: string }) {
  const title = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Layout>
      <SEOHead title={title} description={`${title} — Ankshaastra numerology services`} />
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 text-center max-w-3xl animate-pulse">
          <div className="h-4 w-24 bg-muted rounded mx-auto mb-4" />
          <div className="h-10 w-3/4 max-w-md bg-muted rounded mx-auto mb-4" />
          <div className="h-4 w-full max-w-xl bg-muted/70 rounded mx-auto mb-2" />
          <div className="h-4 w-5/6 max-w-lg bg-muted/70 rounded mx-auto" />
        </div>
      </section>
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="h-8 w-48 bg-muted rounded mx-auto mb-10 animate-pulse" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-border p-6 bg-card animate-pulse">
                <div className="h-4 w-16 bg-muted rounded mb-3" />
                <div className="h-6 w-2/3 bg-muted rounded mb-4" />
                <div className="h-8 w-24 bg-muted rounded mb-6" />
                <div className="h-10 w-full bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default function DynamicServicePage() {
  const { slug = "" } = useParams();
  const [page, setPage] = useState<ServicePageData | null>(null);
  const [packages, setPackages] = useState<ServicePackageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    fetch(`/api/service-pages?slug=${encodeURIComponent(slug)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Not found"))))
      .then((data) => {
        if (cancelled) return;
        setPage(data.page);
        setPackages(data.packages || []);
      })
      .catch(() => {
        if (!cancelled) {
          setPage(null);
          setPackages([]);
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return <ServicePageSkeleton slug={slug} />;
  }

  if (notFound || !page) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold mb-4">Page not found</h1>
          <Link to="/services" className="text-primary hover:underline">Browse all services</Link>
        </div>
      </Layout>
    );
  }

  const features = page.content?.features || [];
  const faqs = page.content?.faqs || [];

  return (
    <Layout>
      <SEOHead
        title={page.seo_title || page.title}
        description={page.seo_description || page.description || undefined}
        canonical={page.route}
      />

      <section className="relative py-16 md:py-24 bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          {page.category && (
            <span className="inline-block mb-4 text-sm font-medium text-primary uppercase tracking-wider">
              {page.category}
            </span>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4"
          >
            {page.title}
          </motion.h1>
          {page.subtitle && (
            <p className="text-lg text-muted-foreground mb-4">{page.subtitle}</p>
          )}
          {page.description && (
            <p className="text-muted-foreground leading-relaxed">{page.description}</p>
          )}
        </div>
      </section>

      {features.length > 0 && (
        <section className="py-12 container mx-auto px-4 max-w-4xl">
          <h2 className="font-display text-2xl font-bold mb-6 text-center">What You Get</h2>
          <ul className="grid md:grid-cols-2 gap-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm md:text-base">
                <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {packages.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-10">Choose Your Plan</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`rounded-2xl border p-6 bg-card flex flex-col ${
                    pkg.is_popular ? "border-primary shadow-lg ring-1 ring-primary/20" : "border-border"
                  }`}
                >
                  {pkg.tag && (
                    <span className="text-xs font-semibold text-primary uppercase mb-2">{pkg.tag}</span>
                  )}
                  <h3 className="font-display text-xl font-bold">{pkg.name}</h3>
                  {pkg.description && (
                    <p className="text-sm text-muted-foreground mt-2 mb-4">{pkg.description}</p>
                  )}
                  <div className="mb-4">
                    <span className="text-2xl font-bold">{formatINR(Number(pkg.price))}</span>
                    {pkg.original_price && (
                      <span className="text-sm text-muted-foreground line-through ml-2">
                        {formatINR(Number(pkg.original_price))}
                      </span>
                    )}
                  </div>
                  {pkg.features?.length > 0 && (
                    <ul className="space-y-2 mb-6 flex-1">
                      {pkg.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link
                    to={buildPaymentUrl(page, pkg)}
                    className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Book Now <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="py-16 container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={faq.q} className="border border-border rounded-xl overflow-hidden">
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-4 text-left font-medium"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {faq.q}
                  <ChevronDown className={`w-5 h-5 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-muted-foreground">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
}
