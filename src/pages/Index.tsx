import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import QuickCategories from "@/components/home/QuickCategories";
import ServicesSection from "@/components/home/ServicesSection";
import CalculatorsSection from "@/components/home/CalculatorsSection";
import YouTubeSection from "@/components/home/YouTubeSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CelebritiesSection from "@/components/home/CelebritiesSection";
import BlogSection from "@/components/home/BlogSection";
import CTASection from "@/components/home/CTASection";
import SEOHead from "@/components/SEOHead";

const Index = () => {
  return (
    <Layout>
      <SEOHead
        title="Numerology & Lal Kitab Remedies by Himansshu Agarwal Ji"
        description="Ankshaastra offers expert numerology consultations, name correction, baby name reports, personalized kundali, and Lal Kitab remedies by Himansshu Agarwal Ji."
        canonical="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Ankshaastra",
          url: "https://ankshaastra.com",
          description: "Expert numerology consultations, name correction, and Lal Kitab remedies by Himansshu Agarwal Ji.",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://ankshaastra.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <HeroSection />
      <QuickCategories />
      <ServicesSection />
      <CalculatorsSection />
      <CelebritiesSection />
      <YouTubeSection />
      <TestimonialsSection />
      <BlogSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
