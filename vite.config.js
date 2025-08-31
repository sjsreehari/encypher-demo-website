import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteBabel } from 'vite-plugin-babel';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteBabel({
      filter: /encypher\/src\/components\/.*\.js$/,
      babelConfig: {
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
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
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
