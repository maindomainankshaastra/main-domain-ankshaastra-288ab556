import Layout from "@/components/Layout";

const About = () => {
  return (
    <Layout>
      <div className="container py-16">
        <h1 className="mb-4 text-3xl font-bold">About</h1>
        <p className="max-w-2xl text-muted-foreground">
          This is a basic React application built with TypeScript, Tailwind CSS,
          and React Router. It provides a clean starting point for building modern
          web applications.
        </p>
      </div>
    </Layout>
  );
};

export default About;
