import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import https from 'node:https';
import http from 'node:http';

const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycby3bg1iDpQTYbj4vmD2dPHyTOlnqNUrg_aOSC5gxdwse5bt0mxtG_cja9t2zh7x8q9bBw/exec';

function gasDevProxyPlugin() {
  return {
    name: 'gas-dev-proxy-plugin',
    configureServer(server) {
      server.middlewares.use('/api/gas', (req, res) => {
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => {
          const reqBody = Buffer.concat(chunks);
          const rawTarget = req.headers['x-gas-target-url'] || DEFAULT_GAS_URL;
          const targetUrl = new URL(rawTarget);

          // Forward search params from the incoming request (e.g. ?action=health)
          const incomingUrl = new URL(req.url, 'http://localhost');
          incomingUrl.searchParams.forEach((val, key) => {
            targetUrl.searchParams.set(key, val);
          });

          function executeGasRequest(destUrl, method, body, redirectCount = 0) {
            if (redirectCount > 5) {
              res.statusCode = 502;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, message: 'Too many redirects from Google Apps Script' }));
              return;
            }

            const parsed = new URL(destUrl);
            const client = parsed.protocol === 'https:' ? https : http;
            const options = {
              hostname: parsed.hostname,
              port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
              path: parsed.pathname + parsed.search,
              method: method,
              headers: {
                'Content-Type': 'text/plain;charset=utf-8'
              }
            };

            const proxyReq = client.request(options, (proxyRes) => {
              if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
                // Follow 302 redirect via GET method as required by Apps Script echo service
                executeGasRequest(proxyRes.headers.location, 'GET', null, redirectCount + 1);
                return;
              }

              res.statusCode = proxyRes.statusCode || 200;
              res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'application/json; charset=utf-8');
              proxyRes.pipe(res);
            });

            proxyReq.on('error', (err) => {
              res.statusCode = 502;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, message: 'Proxy error contacting Apps Script: ' + err.message }));
            });

            if (body && method === 'POST') {
              proxyReq.write(body);
            }
            proxyReq.end();
          }

          executeGasRequest(targetUrl.toString(), req.method || 'POST', reqBody);
        });
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), gasDevProxyPlugin()],
  base: './', // Essential for GitHub Pages relative path resolution
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
