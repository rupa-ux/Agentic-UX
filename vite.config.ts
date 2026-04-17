import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'

// Stub out figma:asset/* imports outside Figma Make. Must be a virtual module (\0 prefix)
// or Vite's asset pipeline tries to read `figma:asset/...` from disk and fails the build.
const FIGMA_ASSET_PREFIX = '\0figma:asset:'

function figmaAssetStubPlugin(): Plugin {
  return {
    name: 'figma-asset-stub',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) return FIGMA_ASSET_PREFIX + id.slice('figma:asset/'.length)
    },
    load(id) {
      if (id.startsWith(FIGMA_ASSET_PREFIX)) {
        // 1×1 transparent GIF — valid `src` for `<img>` when Figma exports are absent
        return `export default "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"`
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetStubPlugin(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
