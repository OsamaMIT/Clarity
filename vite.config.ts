import { resolve } from "node:path";
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

type BuildTarget = "background" | "content" | "options";

function getTarget(mode: string): BuildTarget {
  if (mode === "background" || mode === "content" || mode === "options") {
    return mode;
  }
  return "options";
}

export default defineConfig(({ mode }) => {
  const target = getTarget(mode);

  const baseConfig = {
    plugins: [
      svelte({
        compilerOptions: {
          css: "injected",
          compatibility: {
            componentApi: 4
          }
        }
      })
    ],
    base: "./"
  };

  if (target === "background" || target === "content") {
    const entryFile = target === "background" ? "src/background.ts" : "src/content.ts";
    const outName = target === "background" ? "background.js" : "content.js";
    const libName = target === "background" ? "ClarteBackground" : "ClarteContent";

    return {
      ...baseConfig,
      build: {
        outDir: "dist",
        emptyOutDir: target === "background",
        sourcemap: false,
        lib: {
          entry: resolve(__dirname, entryFile),
          name: libName,
          formats: ["iife"],
          fileName: () => outName
        },
        rollupOptions: {
          output: {
            inlineDynamicImports: true
          }
        }
      }
    };
  }

  return {
    ...baseConfig,
    build: {
      outDir: "dist",
      emptyOutDir: false,
      sourcemap: false,
      rollupOptions: {
        input: {
          options: resolve(__dirname, "options.html"),
          popup: resolve(__dirname, "popup.html")
        },
        output: {
          entryFileNames: "[name].js",
          chunkFileNames: "chunks/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash][extname]"
        }
      }
    }
  };
});
