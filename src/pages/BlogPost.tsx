import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User, Tag, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { blogPosts } from "@/data/blogPosts";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.id === slug);

  if (!post) return <Navigate to="/blog" replace />;

  const relatedPosts = blogPosts
    .filter((p) => p.id !== post.id && p.category === post.category)
    .slice(0, 2);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: post.title, text: post.excerpt, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  // Simple markdown-like rendering for ## headings, **bold**, and numbered lists
  const renderContent = (content: string) => {
    return content.split("\n").map((line, i) => {
      if (line.startsWith("## ")) {
        return (
          <h2 key={i} className="font-display text-2xl font-bold text-foreground mt-8 mb-4">
            {line.replace("## ", "")}
          </h2>
        );
      }
      if (line.match(/^\d+\.\s\*\*/)) {
        const parts = line.match(/^(\d+\.)\s\*\*(.+?)\*\*\s*—?\s*(.*)/);
        if (parts) {
          return (
            <div key={i} className="flex gap-3 mb-3">
              <span className="text-primary font-bold">{parts[1]}</span>
              <p className="text-muted-foreground">
                <strong className="text-foreground">{parts[2]}</strong>
                {parts[3] && ` — ${parts[3]}`}
              </p>
            </div>
          );
        }
      }
      if (line.startsWith("- **")) {
        const parts = line.match(/^-\s\*\*(.+?)\*\*\s*(.*)/);
        if (parts) {
          return (
            <li key={i} className="ml-4 mb-2 text-muted-foreground list-disc">
              <strong className="text-foreground">{parts[1]}</strong> {parts[2]}
            </li>
          );
        }
      }
      if (line.trim() === "") return <div key={i} className="h-3" />;
      return (
        <p key={i} className="text-muted-foreground leading-relaxed mb-2">
          {line}
        </p>
      );
    });
  };

  return (
    <Layout>
      <SEOHead
        title={post.title}
        description={post.excerpt}
        canonical={`/blog/${post.id}`}
        ogImage={post.image}
        ogType="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          image: post.image,
          author: { "@type": "Person", name: post.author },
          datePublished: post.date,
          publisher: {
            "@type": "Organization",
            name: "Ankshaastra",
          },
        }}
      />

      <article className="section-container py-8 md:py-12">
        {/* Back */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              {post.category}
            </Badge>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" /> {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> {post.readTime}
              </span>
              <Button variant="ghost" size="sm" onClick={handleShare} className="ml-auto">
                <Share2 className="w-4 h-4 mr-1" /> Share
              </Button>
            </div>
          </motion.div>

          {/* Featured Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-xl overflow-hidden mb-10"
          >
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover"
            />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="prose-custom"
          >
            {renderContent(post.content)}
          </motion.div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-border">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-sm bg-muted text-muted-foreground px-3 py-1 rounded-full"
              >
                <Tag className="w-3 h-3" /> {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="max-w-3xl mx-auto mt-16">
            <h3 className="font-display text-2xl font-bold text-foreground mb-6">
              Related Articles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((rp) => (
                <Link key={rp.id} to={`/blog/${rp.id}`} className="group">
                  <Card className="overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-border/50">
                    <div className="h-36 overflow-hidden">
                      <img
                        src={rp.image}
                        alt={rp.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <CardContent className="p-4">
                      <p className="font-display font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {rp.title}
                      </p>
                      <span className="text-xs text-muted-foreground mt-2 block">{rp.readTime}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </Layout>
  );
};

export default BlogPost;
