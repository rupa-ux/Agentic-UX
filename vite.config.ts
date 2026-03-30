import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'

// Stub out figma:asset/* imports for local dev (they only resolve inside Figma Make)
function figmaAssetStubPlugin(): Plugin {
  return {
    name: 'figma-asset-stub',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) return id
    },
    load(id) {
      if (id.startsWith('figma:asset/')) return 'export default ""'
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
