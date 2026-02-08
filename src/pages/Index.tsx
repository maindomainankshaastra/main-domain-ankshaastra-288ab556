import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <Layout>
      <section className="container flex flex-col items-center justify-center gap-6 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Welcome to MyApp
        </h1>
        <p className="max-w-lg text-lg text-muted-foreground">
          A clean, minimal React application ready for you to build something great.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link to="/about">Learn More</Link>
          </Button>
          <Button variant="outline" asChild>
            <a href="https://docs.lovable.dev/" target="_blank" rel="noopener noreferrer">
              Documentation
            </a>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
