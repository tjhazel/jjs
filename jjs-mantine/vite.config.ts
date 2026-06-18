import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
      babel({ presets: [reactCompilerPreset()] })
   ],
   resolve: {
      tsconfigPaths: true, 
      alias: {
         '@': path.resolve(__dirname, './src'),
         '@lib': path.resolve(__dirname, './src/lib'),
         '@api': path.resolve(__dirname, './src/api'),
         '@components': path.resolve(__dirname, './src/components'),
      },
   },
})
