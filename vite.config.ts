import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@reduxjs/toolkit",
      "react-redux",
      "axios",
      "zod",
      "react-hook-form",
      "@hookform/resolvers",
      "clsx",
      "class-variance-authority",
      "tailwind-merge",
      "lucide-react",
      "uuid",
      "styled-components",
      "@emotion/react",
      "@emotion/styled",
      "@mui/material",
      "@mui/icons-material",
      "@mui/lab",
      "@mui/x-data-grid",
      "antd",
      "ag-grid-community",
      "ag-grid-react",
      "@ag-grid-community/core",
      "@ag-grid-community/react",
      "@ag-grid-community/client-side-row-model",
      "@ag-grid-enterprise/row-grouping",
    ],
    exclude: ["@fingerprintjs/fingerprintjs", "offline-js"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          redux: ["@reduxjs/toolkit", "react-redux"],
          ui: [
            "@mui/material",
            "@mui/icons-material",
            "@mui/lab",
            "@mui/x-data-grid",
            "antd",
          ],
          grid: [
            "ag-grid-community",
            "ag-grid-react",
            "@ag-grid-community/core",
            "@ag-grid-community/react",
          ],
          forms: ["react-hook-form", "@hookform/resolvers", "zod"],
          utils: [
            "axios",
            "clsx",
            "class-variance-authority",
            "tailwind-merge",
            "uuid",
          ],
        },
      },
    },
  },
});
