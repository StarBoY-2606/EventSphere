import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
 
export default defineConfig(() => {
  const nodeModules = path.resolve(__dirname, 'node_modules');
 
  // In Docker, DOCKER_BUILD=true is set, so frontend is at ./frontend
  // Locally, frontend is at ../frontend
  const isDocker = process.env.DOCKER_BUILD === 'true';
  const frontendRoot = isDocker
    ? path.resolve(__dirname, './frontend')
    : path.resolve(__dirname, '../frontend');
 
  return {
    root: frontendRoot,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': frontendRoot,
        'react': path.resolve(nodeModules, 'react'),
        'react-dom': path.resolve(nodeModules, 'react-dom'),
        'react/jsx-runtime': path.resolve(nodeModules, 'react/jsx-runtime'),
        'react/jsx-dev-runtime': path.resolve(nodeModules, 'react/jsx-dev-runtime'),
        'motion/react': path.resolve(nodeModules, 'motion/react'),
        'lucide-react': path.resolve(nodeModules, 'lucide-react'),
        'recharts': path.resolve(nodeModules, 'recharts'),
        'tailwindcss': path.resolve(nodeModules, 'tailwindcss'),
        '@tailwindcss/vite': path.resolve(nodeModules, '@tailwindcss/vite'),
      },
    },
    build: {
      outDir: path.resolve(__dirname, 'dist/public'),
      emptyOutDir: true,
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
