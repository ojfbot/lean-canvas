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
        './Dashboard': './src/components/CanvasDashboard',
        './Settings': './src/pages/Settings',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.3.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.3.0' },
        '@reduxjs/toolkit': { singleton: true, requiredVersion: '^2.0.0' },
        'react-redux': { singleton: true, requiredVersion: '^9.0.0' },
        '@carbon/react': { singleton: true, requiredVersion: '^1.71.0' },
      },
    }),
  ],
  // Treat frame-ui-components as source (file: linked, not pre-built)
  optimizeDeps: {
    exclude: ['@ojfbot/frame-ui-components'],
    // CJS transitive deps of the excluded package must be explicitly included
    // so Vite pre-bundles them into ESM — otherwise browsers get CJS/ESM mismatch.
    include: [
      '@ojfbot/frame-ui-components > react-markdown',
      '@ojfbot/frame-ui-components > hast-util-to-jsx-runtime',
      '@ojfbot/frame-ui-components > style-to-js',
      '@ojfbot/frame-ui-components > style-to-object',
    ],
  },
  server: {
    port: 3025,
    fs: {
      allow: ['../../..'],
    },
  },
  preview: { port: 3025 },
  build: {
    target: 'esnext',
    minify: false,
  },
})
