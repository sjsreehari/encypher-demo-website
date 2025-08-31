import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        // Force JSX transform for .js files in encypher
        include: [
          /encypher[\\/]src[\\/]components[\/].*\.js$/
        ],
        presets: [
          [
            '@babel/preset-react',
            { runtime: 'automatic' }
          ]
        ]
      }
    })
  ],
  optimizeDeps: {
    include: ['encypher'],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: [],
    },
  },
  define: {
    global: 'globalThis',
  },
  ssr: {
    noExternal: ['encypher'],
  },
  // resolve: {
  //   alias: {
  //     'encypher': 'encypher/dist/index.js',
  //   },
  // },
});
