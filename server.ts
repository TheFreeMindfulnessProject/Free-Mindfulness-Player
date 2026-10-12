import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import https from 'https';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProd = process.env.NODE_ENV === 'production';

  // Audio streaming proxy endpoint with Range support and CORS headers
  app.get('/api/audio/:driveId', (req: Request, res: Response) => {
    const driveId = req.params.driveId;
    if (!driveId || !/^[a-zA-Z0-9_-]+$/.test(driveId)) {
      res.status(400).json({ error: 'Invalid drive ID' });
      return;
    }

    const rangeHeader = req.headers.range;

    function fetchAndPipe(targetUrl: string, redirectCount = 0) {
      if (redirectCount > 5) {
        if (!res.headersSent) {
          res.status(502).json({ error: 'Too many redirects' });
        }
        return;
      }

      const client = targetUrl.startsWith('https') ? https : http;
      const requestOptions: https.RequestOptions = {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          ...(rangeHeader ? { Range: rangeHeader } : {}),
        },
      };

      const gReq = client.get(targetUrl, requestOptions, (gRes) => {
        // Follow redirect if 3xx
        if (
          gRes.statusCode &&
          gRes.statusCode >= 300 &&
          gRes.statusCode < 400 &&
          gRes.headers.location
        ) {
          gRes.resume();
          fetchAndPipe(gRes.headers.location, redirectCount + 1);
          return;
        }

        const statusCode = gRes.statusCode || 200;
        res.status(statusCode);

        res.setHeader('Content-Type', gRes.headers['content-type'] || 'audio/mpeg');
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Range, Accept');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');
        res.setHeader('Cache-Control', 'public, max-age=86400');

        if (gRes.headers['content-length']) {
          res.setHeader('Content-Length', gRes.headers['content-length']);
        }
        if (gRes.headers['content-range']) {
          res.setHeader('Content-Range', gRes.headers['content-range']);
        }
        if (gRes.headers['content-disposition']) {
          res.setHeader('Content-Disposition', gRes.headers['content-disposition']);
        }

        gRes.pipe(res);
      });

      gReq.on('error', (err) => {
        console.error('Error proxying audio from Google Drive:', err);
        if (!res.headersSent) {
          res.status(502).json({ error: 'Failed to fetch audio stream' });
        }
      });
    }

    const initialUrl = `https://drive.usercontent.google.com/download?id=${driveId}&export=download`;
    fetchAndPipe(initialUrl);
  });

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
