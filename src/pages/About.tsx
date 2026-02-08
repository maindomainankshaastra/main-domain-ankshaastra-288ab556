import Layout from "@/components/layout/Layout";

const About = () => {
  return (
    <Layout>
      <div className="section-container section-padding">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
          About <span className="text-gradient-primary">Ankshaastra</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Led by Himansshu Agarwal Ji, a renowned Name Correction Expert and Lal Kitab Remedy Specialist 
          with over 10 years of dedicated research and practical experience in numerology.
        </p>
      </div>
    </Layout>
  );
};

export default About;