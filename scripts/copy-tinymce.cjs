#!/usr/bin/env node
/**
 * Expose TinyMCE (plugins, skins, etc.) under /tinymce for self-hosted mode.
 * Runs on postinstall so Vercel builds serve the editor without a cloud API key.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const src = path.join(root, "node_modules", "tinymce");
const dest = path.join(root, "public", "tinymce");

if (!fs.existsSync(src)) {
  console.warn("[copy-tinymce] skip: node_modules/tinymce not found");
  process.exit(0);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });
console.log("[copy-tinymce] synced to public/tinymce");
