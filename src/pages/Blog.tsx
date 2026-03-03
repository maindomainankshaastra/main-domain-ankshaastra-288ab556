import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Calendar, Clock, ArrowRight, Tag } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { blogPosts, BLOG_CATEGORIES } from "@/data/blogPosts";

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesCategory = activeCategory === "All" || post.category === activeCategory;
      const matchesSearch =
        searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  return (
    <Layout>
      <SEOHead
        title="Blog & Insights"
        description="Read expert articles on numerology, name correction, Lal Kitab remedies, Vastu tips, and spiritual guidance by Himansshu Agarwal."
        canonical="/blog"
      />

      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero py-16 md:py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-accent/30 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-primary/20 blur-3xl" />
        </div>
        <div className="section-container relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-4"
          >
            Blog & Insights
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto"
          >
            Explore articles on numerology, name correction, and spiritual guidance by Himansshu Agarwal Ji.
          </motion.p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="section-container -mt-8 relative z-20">
        <Card className="shadow-lg border-border/50">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 mt-4">
              {BLOG_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeCategory === category
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Posts Grid */}
      <section className="section-container section-padding">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">No articles found matching your search.</p>
            <button
              onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
              className="mt-4 text-primary font-medium hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Link to={`/blog/${post.id}`} className="group block h-full">
                  <Card className="h-full overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground">
                        {post.category}
                      </Badge>
                    </div>

                    <CardContent className="p-5">
                      {/* Meta */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="font-display text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {post.excerpt}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            <Tag className="w-2.5 h-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Read more */}
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                        Read More <ArrowRight className="w-4 h-4" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Blog;
