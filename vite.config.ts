// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react-swc";
// import path from "path";
// import { componentTagger } from "lovable-tagger";

// export default defineConfig(({ mode }) => ({
//   server: {
//     host: "::",
//     port: 8080,
//   },
//   plugins: [
//     react(),
//     mode === 'development' && componentTagger(),
//   ].filter(Boolean),
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
//   build: {
//     target: "es2020",
//     cssCodeSplit: true,
//     rollupOptions: {
//       output: {
//         manualChunks(id) {
//           if (!id.includes("node_modules")) return undefined;
//           if (id.includes("react-router-dom") || id.includes("react-dom") || id.includes("/react/")) {
//             return "react-vendor";
//           }
//           if (id.includes("framer-motion")) {
//             return "motion";
//           }
//           if (
//             id.includes("@radix-ui/react-dialog") ||
//             id.includes("@radix-ui/react-popover") ||
//             id.includes("@radix-ui/react-dropdown-menu") ||
//             id.includes("@radix-ui/react-select") ||
//             id.includes("@radix-ui/react-tabs")
//           ) {
//             return "ui-vendor";
//           }
//           if (id.includes("@supabase/supabase-js")) {
//             return "supabase";
//           }
//           return undefined;
//         },
//       },
//     },
//   },
// }));

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Hosted previews serve CDN pointers before Vite; local previews need the same image endpoint.
      "/__l5e/assets-v1": {
        target: "https://id-preview--cd45ad11-7c36-477d-a497-c78207f3eb0f.lovable.app",
        changeOrigin: true,
        secure: true,
      },
      "/api": {
        target: "http://localhost:8081",
        changeOrigin: true,
      },
    },
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