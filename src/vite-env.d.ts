/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TINYMCE_API_KEY?: string;
  /** Exposé si défini dans .env (voir envPrefix TINYMCE_ dans vite.config). */
  readonly TINYMCE_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
