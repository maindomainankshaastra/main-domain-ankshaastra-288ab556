import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { BookOpen, Sparkles } from "lucide-react";

const CoursesPage = () => {
  return (
    <Layout>
      <section className="min-h-[80vh] flex items-center justify-center relative overflow-hidden">
        {/* Vibrant Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large gradient orbs */}
          <motion.div 
            className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-orange-500/30 via-amber-400/25 to-yellow-500/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute -bottom-40 -right-20 w-[600px] h-[600px] bg-gradient-to-tl from-rose-500/25 via-orange-400/20 to-amber-500/25 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-gradient-to-r from-yellow-400/20 via-orange-300/25 to-rose-400/20 rounded-full blur-3xl"
            animate={{ x: [-20, 20, -20], y: [10, -10, 10] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-1/4 left-1/3 w-[350px] h-[350px] bg-gradient-to-br from-amber-500/20 to-orange-600/15 rounded-full blur-3xl"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          
          {/* Floating sparkles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-lg shadow-amber-500/50"
              style={{
                left: `${10 + i * 8}%`,
                top: `${15 + (i % 4) * 20}%`,
              }}
              animate={{
                y: [-30, 30, -30],
                x: [-10, 10, -10],
                opacity: [0.3, 0.8, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 5 + i * 0.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
            />
          ))}
          
          {/* Shimmer lines */}
          <motion.div
            className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent"
            animate={{ opacity: [0, 0.6, 0], x: [-100, 100, -100] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-400/30 to-transparent"
            animate={{ opacity: [0, 0.5, 0], x: [100, -100, 100] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-3xl mx-auto"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 mb-8"
            >
              <BookOpen className="w-10 h-10 text-primary" />
            </motion.div>

            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6"
            >
              Courses <span className="text-gradient-primary">Coming Soon</span>
            </motion.h1>

            {/* Main message */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="font-body text-xl md:text-2xl text-muted-foreground leading-relaxed"
            >
              Courses will be launching shortly.
            </motion.p>

            {/* Decorative line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="w-24 h-1 bg-gradient-to-r from-primary to-accent rounded-full mx-auto mt-10"
            />
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default CoursesPage;
