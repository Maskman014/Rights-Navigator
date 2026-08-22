import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Security: only these endpoint names may be loaded by the dev middleware.
// Prevents path traversal via crafted /api/../../ URLs.
const ALLOWED_API_ENDPOINTS = new Set(['assess', 'explain', 'cases', 'auth']);

// Security: reject request bodies larger than this to prevent DoS.
const MAX_REQUEST_BODY_BYTES = 65_536; // 64 KB

export default defineConfig(({ mode }) => {
  // Access global process via globalThis to bypass missing @types/node checks
  const globalProc = (globalThis as any).process;
  const cwd = globalProc?.cwd?.() || '.';
  const env = loadEnv(mode, cwd, '');

  if (globalProc?.env) {
    Object.assign(globalProc.env, env);
  }

  return {
    plugins: [
      react(),
      {
        name: 'local-api-middleware',
        configureServer(server) {
          server.middlewares.use(async (req: any, res: any, next: any) => {
            const reqUrl: string = req.url || '';
            if (!reqUrl.startsWith('/api/')) return next();

            // Fix #2 — Allowlist endpoint name to prevent path traversal
            const rawSegment = reqUrl.split('?')[0].replace('/api/', '').split('/')[0];
            if (!ALLOWED_API_ENDPOINTS.has(rawSegment)) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'API endpoint not found' }));
              return;
            }
            const endpoint = rawSegment; // safe — allowlisted value

            // Fix #4 — Body size limit to prevent DoS
            let body = '';
            let bodyBytes = 0;
            let tooLarge = false;

            req.on('data', (chunk: any) => {
              const chunkSize: number =
                typeof chunk.length === 'number' ? chunk.length : chunk.byteLength ?? 0;
              bodyBytes += chunkSize;

              if (bodyBytes > MAX_REQUEST_BODY_BYTES) {
                if (!tooLarge) {
                  tooLarge = true;
                  res.statusCode = 413;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Request body too large (limit: 64 KB)' }));
                  req.destroy();
                }
                return;
              }
              body += chunk;
            });

            req.on('end', async () => {
              if (tooLarge) return;

              try {
                if (body) {
                  req.body = JSON.parse(body);
                }
              } catch (e) {
                // Ignore non-JSON payload errors
              }

              try {
                const module = await server.ssrLoadModule(`./api/${endpoint}.ts`);

                res.status = (code: number) => {
                  res.statusCode = code;
                  return res;
                };
                res.json = (data: any) => {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                };

                await module.default(req, res);
              } catch (err: any) {
                console.error('Local API Error:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message || 'Internal API Error' }));
              }
            });
          });
        },
      },
    ],
  };
});
