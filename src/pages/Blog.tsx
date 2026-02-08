import Layout from "@/components/layout/Layout";

const Blog = () => {
  return (
    <Layout>
      <div className="section-container section-padding">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
          <span className="text-gradient-primary">Blog</span> & Insights
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Explore articles on numerology, name correction, and spiritual guidance.
        </p>
      </div>
    </Layout>
  );
};

export default Blog;