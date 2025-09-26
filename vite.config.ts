import path from 'path';
import { createRequire } from 'module';
import { defineConfig, normalizePath } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { fileURLToPath } from 'url';
import eslint from 'vite-plugin-eslint';
import checker from 'vite-plugin-checker';

// Derive __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);
const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));

// Paths for cmap and standard fonts directories
const cMapsDir = normalizePath(path.join(pdfjsDistPath, 'cmaps'));
const standardFontsDir = normalizePath(path.join(pdfjsDistPath, 'standard_fonts'));

// Vite config
export default defineConfig(() => {
  return {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor'; // All node_modules code will be bundled into a single 'vendor' chunk
            }
          },
        },
      },
      chunkSizeWarningLimit: 6000, // Set the limit (in KB) for chunk size warnings
    },
    plugins: [
      react(),
      svgr(),
      eslint({
        // Show ESLint output in terminal
        include: ['src/**/*.ts', 'src/**/*.tsx'],
        emitError: true,
        failOnError: true,
      }),
      checker({
        typescript: true,
        terminal: true,
      }),
      viteStaticCopy({
        targets: [
          { src: cMapsDir, dest: '' },
          { src: standardFontsDir, dest: '' },
        ],
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@layouts': path.resolve(__dirname, 'src/layouts'),
        '@routes': path.resolve(__dirname, 'src/routes'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@constants': path.resolve(__dirname, 'src/constants'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@assets': path.resolve(__dirname, 'src/assets'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@types': path.resolve(__dirname, 'src/types'),
      },
    },
  };
});