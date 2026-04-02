import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { tempo } from "tempo-devtools/dist/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: process.env.TEMPO === "true" ? true : undefined,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    tempo(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    /** Répartit les grosses libs hors du chunk `index` (meilleur cache + moins de parse au 1er chargement). */
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("@hello-pangea/dnd")) return "vendor-dnd";
          if (id.includes("recharts")) return "vendor-recharts";
          if (id.includes("framer-motion")) return "vendor-motion";
          if (id.includes("@supabase/supabase-js")) return "vendor-supabase";
          if (id.includes("@tanstack/react-query")) return "vendor-query";
        },
      },
    },
    /** @hello-pangea/dnd reste > 500 ko minifié ; seuil réaliste pour éviter un faux positif à chaque build. */
    chunkSizeWarningLimit: 750,
  },
}));
