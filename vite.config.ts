import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { tempo } from "tempo-devtools/dist/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  /** Permet aussi TINYMCE_API_KEY dans .env (sans préfixe VITE_) pour l’éditeur cloud. */
  envPrefix: ["VITE_", "TINYMCE_"],
  server: {
    host: "::",
    port: 8080,
    allowedHosts: process.env.TEMPO === "true" ? true : undefined,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Tempo uniquement en dev : évite "Empty routes array generated" et allège le build Vercel
    mode === "development" && tempo(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      ...(mode === "production"
        ? { "tempo-routes": path.resolve(__dirname, "./src/tempo-routes.stub.ts") }
        : {}),
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
          if (id.includes("@iconify/react")) return "vendor-iconify";
        },
      },
    },
    /** Au-dessus du défaut Vite (500) : grosses deps (dnd, éditeur, etc.). */
    chunkSizeWarningLimit: 1200,
  },
}));
