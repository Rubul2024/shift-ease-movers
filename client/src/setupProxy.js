// Dev-only: forwards /api calls from the CRA dev server to the Express API.
// Replaces the package.json "proxy" field, which crashes CRA 5 on some networks
// ("options.allowedHosts[0] should be a non-empty string") and resolves "localhost"
// to IPv6 on Node 17+, producing ECONNREFUSED ::1:5000.
const { createProxyMiddleware } = require('http-proxy-middleware');

const target = process.env.API_PROXY_TARGET || 'http://127.0.0.1:5000';

module.exports = function setupProxy(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target,
      changeOrigin: true,
      logLevel: 'silent',
      onError(err, req, res) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            message: `API server is not running at ${target}. Start it with "npm run dev" in the server folder.`,
          })
        );
      },
    })
  );
};
