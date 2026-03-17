import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cssInjectedByJs from 'vite-plugin-css-injected-by-js'
import federation from '@originjs/vite-plugin-federation'

// NOTE: cssInjectedByJs must come BEFORE federation (see app-templates.md invariant)
export default defineConfig({
  plugins: [
    react(),
    cssInjectedByJs({
      jsAssetsFilterFunction: (outputChunk) =>
        outputChunk.fileName.includes('__federation_expose_'),
    }),
    federation({
      name: 'lean_canvas',
      filename: 'remoteEntry.js',
      exposes: {
        './Dashboard': './src/components/LeanCanvasGrid',
        './Settings': './src/pages/Settings',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.3.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.3.0' },
        '@carbon/react': { singleton: true, requiredVersion: '^1.71.0' },
      },
    }),
  ],
  server: { port: 3020 },
  preview: { port: 3020 },
  build: {
    target: 'esnext',
    minify: false,
  },
})
