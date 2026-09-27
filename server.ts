import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isDev = process.env.NODE_ENV !== 'production';

  app.use(express.json());

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Economic Data Explorer API Gateway',
      time: new Date().toISOString()
    });
  });

  // Eurostat proxy route for CORS fallback if requested
  app.get('/api/eurostat/data/:dataset', async (req, res) => {
    const { dataset } = req.params;
    const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
    const eurostatUrl = `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${dataset}?${queryString}`;

    try {
      const response = await fetch(eurostatUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'EconomicDataExplorer/1.0'
        }
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (err) {
      res.status(502).json({
        error: 'Eurostat upstream gateway error',
        details: err instanceof Error ? err.message : String(err)
      });
    }
  });

  // IMF DataMapper proxy route
  app.get('/api/imf/indicator/:code', async (req, res) => {
    const { code } = req.params;
    const countries = req.query.countries ? `/${req.query.countries}` : '';
    const periods = req.query.periods ? `?periods=${req.query.periods}` : '';
    const imfUrl = `https://www.imf.org/external/datamapper/api/v2/${code}${countries}${periods}`;

    try {
      const response = await fetch(imfUrl, {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });
      if (response.ok) {
        const data = await response.json();
        return res.json(data);
      }
      return res.status(response.status).json({ error: 'IMF upstream returned non-200' });
    } catch (err) {
      res.status(502).json({
        error: 'IMF upstream gateway error',
        details: err instanceof Error ? err.message : String(err)
      });
    }
  });

  if (isDev) {
    // Vite middleware for dev
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Economic Data Explorer server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
