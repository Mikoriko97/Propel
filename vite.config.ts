import { defineConfig, loadEnv } from 'vite';
import fs from 'fs';
import path from 'path';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const disableCoep = env.VITE_DISABLE_COEP === '1' || env.VITE_DISABLE_COEP === 'true';
  const headers = disableCoep ? {} : {
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Resource-Policy': 'cross-origin',
  };
  return {
  plugins: [
    react(),
    {
      name: 'linera-snippets-serve',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const reqUrl = new URL(req.url ?? '/', 'http://localhost');
          const p = reqUrl.pathname;
          if (p.startsWith('/node_modules/@linera/client/dist/')) {
            const filePath = path.resolve(process.cwd(), p.slice(1));
            if (fs.existsSync(filePath)) {
              if (filePath.endsWith('.wasm')) res.setHeader('Content-Type', 'application/wasm');
              else if (filePath.endsWith('.js')) res.setHeader('Content-Type', 'application/javascript');
              else if (filePath.endsWith('.json')) res.setHeader('Content-Type', 'application/json');
              fs.createReadStream(filePath).pipe(res);
              return;
            }
          }
          next();
        });
      },
    },
  ],
  server: {
    headers,
    proxy: {
      '/linera-faucet': {
        target: 'https://faucet.testnet-conway.linera.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/linera-faucet/, ''),
      },
      '/linera-rpc': {
        target: 'https://faucet.testnet-conway.linera.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/linera-rpc/, ''),
      },
    },
  },
  preview: {
    headers,
  },
  build: {
    rollupOptions: {
      preserveEntrySignatures: 'strict',
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react', '@linera/client'],
  },
};
});
