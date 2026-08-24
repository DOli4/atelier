import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Project page (https://doli4.github.io/atelier/) → base "/atelier/".
export default defineConfig({
  base: "/atelier/",
  server: process.env.PORT ? { port: Number(process.env.PORT), strictPort: true } : undefined,
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom", "gsap"],
  },
});
