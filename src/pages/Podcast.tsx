import Layout from "@/components/layout/Layout";

const Podcast = () => {
  return (
    <Layout>
      <div className="section-container section-padding">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
          The <span className="text-gradient-primary">Ankshaastra Podcast</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Listen to insightful conversations about numerology, life guidance, and spiritual wisdom.
        </p>
      </div>
    </Layout>
  );
};

export default Podcast;