import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("react-router-dom") || id.includes("react-dom") || id.includes("/react/")) {
            return "react-vendor";
          }
          if (id.includes("framer-motion")) {
            return "motion";
          }
          if (
            id.includes("@radix-ui/react-dialog") ||
            id.includes("@radix-ui/react-popover") ||
            id.includes("@radix-ui/react-dropdown-menu") ||
            id.includes("@radix-ui/react-select") ||
            id.includes("@radix-ui/react-tabs")
          ) {
            return "ui-vendor";
          }
          if (id.includes("@supabase/supabase-js")) {
            return "supabase";
          }
          return undefined;
        },
      },
    },
  },
}));
