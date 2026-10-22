// NEW FILE (project root): cloudinary-plugin.ts
// Signs Cloudinary upload requests so the API secret never reaches the browser.
import crypto from 'crypto';
import type { IncomingMessage, ServerResponse } from 'http';
import type { Plugin } from 'vite';

type Env = Record<string, string>;

const pick = (env: Env, key: string) => (env[key] || process.env[key] || '').trim();

// Only these folders may be uploaded to.
const ALLOWED_FOLDERS = ['kolhapur-saree/products', 'kolhapur-saree/hero', 'kolhapur-saree/categories'];

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function readJson(req: IncomingMessage, limit = 5_000): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (c) => {
      body += c;
      if (body.length > limit) { reject(new Error('Request too large')); req.destroy(); }
    });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); } catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

export function cloudinaryPlugin(env: Env): Plugin {
  const handler = async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== 'POST') return sendJson(res, 405, { success: false, error: 'Method not allowed' });

    const cloudName = pick(env, 'CLOUDINARY_CLOUD_NAME');
    const apiKey = pick(env, 'CLOUDINARY_API_KEY');
    const apiSecret = pick(env, 'CLOUDINARY_API_SECRET');
    if (!cloudName || !apiKey || !apiSecret) {
      return sendJson(res, 500, { success: false, error: 'Cloudinary env vars missing in .env' });
    }

    try {
      const { folder = 'kolhapur-saree/products' } = await readJson(req);
      if (!ALLOWED_FOLDERS.includes(folder)) {
        return sendJson(res, 400, { success: false, error: 'Folder not allowed' });
      }

      const timestamp = Math.floor(Date.now() / 1000);
      // Params to sign: alphabetical, joined with &, secret appended, SHA-1.
      const toSign = `folder=${folder}&timestamp=${timestamp}`;
      const signature = crypto.createHash('sha1').update(toSign + apiSecret).digest('hex');

      sendJson(res, 200, { success: true, cloudName, apiKey, timestamp, folder, signature });
    } catch (e: any) {
      sendJson(res, 500, { success: false, error: e?.message || 'Server error' });
    }
  };

  return {
    name: 'cloudinary-signer',
    configureServer(server) { server.middlewares.use('/api/v1/cloudinary-sign', handler); },
    configurePreviewServer(server) { server.middlewares.use('/api/v1/cloudinary-sign', handler); }
  };
}