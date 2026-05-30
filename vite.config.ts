import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Base path for GitHub Pages: set via env at build time (e.g. /repo-name/).
// Locally and on root-domain hosts (Vercel, Netlify) leave it as "/".
const base = process.env.VITE_BASE ?? "/";

export default defineConfig({
  base,
  plugins: [react()],
  server: { port: 5173 },
});
