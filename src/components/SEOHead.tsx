import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  jsonLd?: Record<string, unknown>;
}

const SITE_NAME = "Ankshaastra";
const DEFAULT_DESCRIPTION = "Ankshaastra by Himansshu Agarwal Ji – Numerology, Lal Kitab remedies, name correction, baby name reports, personalized kundali, and consultation services.";
const BASE_URL = "https://ankshaastra.com";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.jpg`;

const SEOHead = ({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  jsonLd,
}: SEOHeadProps) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} – Empower Your Name`;

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (name: string, content: string, attr = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", description);
    setMeta("og:title", fullTitle, "property");
    setMeta("og:description", description, "property");
    setMeta("og:type", ogType, "property");
    const absoluteOgImage = ogImage.startsWith("http") ? ogImage : `${BASE_URL}${ogImage.startsWith("/") ? "" : "/"}${ogImage}`;
    setMeta("og:image", absoluteOgImage, "property");
    setMeta("og:site_name", SITE_NAME, "property");
    setMeta("twitter:card", "summary_large_image", "name");
    setMeta("twitter:title", fullTitle, "name");
    setMeta("twitter:description", description, "name");

    if (canonical) {
      setMeta("og:url", `${BASE_URL}${canonical}`, "property");
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", `${BASE_URL}${canonical}`);
    }

    // JSON-LD
    const existingScript = document.querySelector('script[data-seo-jsonld]');
    if (existingScript) existingScript.remove();

    const ldData = jsonLd || {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: "Ankshaastra",
      description: DEFAULT_DESCRIPTION,
      url: BASE_URL,
      founder: {
        "@type": "Person",
        name: "Himansshu Agarwal",
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: "Unit No. O-622, Block E, Eye of Noida, Sector-140A",
        addressLocality: "Noida",
        postalCode: "201305",
        addressCountry: "IN",
      },
      telephone: "+91-96673-05577",
      email: "social@ankshaastra.com",
      sameAs: [
        "https://instagram.com",
        "https://youtube.com",
        "https://facebook.com",
        "https://linkedin.com",
      ],
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-seo-jsonld", "true");
    script.textContent = JSON.stringify(ldData);
    document.head.appendChild(script);

    return () => {
      const s = document.querySelector('script[data-seo-jsonld]');
      if (s) s.remove();
    };
  }, [fullTitle, description, canonical, ogImage, ogType, jsonLd]);

  return null;
};

export default SEOHead;
