import type { StorybookConfig } from "@storybook/react-vite";
import path from "path";

const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  async viteFinal(config) {
    const { mergeConfig } = await import("vite");
    const { default: tailwindcss } = await import("@tailwindcss/vite");

    function figmaAssetStubPlugin() {
      return {
        name: "figma-asset-stub",
        enforce: "pre" as const,
        resolveId(id: string) {
          if (id.startsWith("figma:asset/")) return id;
        },
        load(id: string) {
          if (id.startsWith("figma:asset/")) return 'export default ""';
        },
      };
    }

    // When deploying to GitHub Pages the workflow sets STORYBOOK_BASE=/ShareConsolidated/
    // so all built assets resolve from the correct sub-path.
    // Locally (no env var) it falls back to "/" so nothing changes.
    const base = process.env.STORYBOOK_BASE ?? "/";

    return mergeConfig(config, {
      base,
      plugins: [tailwindcss(), figmaAssetStubPlugin()],
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "../src"),
        },
      },
    });
  },
};

export default config;
