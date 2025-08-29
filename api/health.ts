import { VercelRequest, VercelResponse } from '@vercel/node';

const ALLOWED_ORIGINS = [
  'https://lovable.dev',
  'https://*.lovable.dev',
  'http://localhost:3000',
  'http://localhost:5173'
];

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return false;
  
  return ALLOWED_ORIGINS.some(allowed => {
    if (allowed.includes('*')) {
      const pattern = allowed.replace('*', '.*');
      return new RegExp(pattern).test(origin);
    }
    return allowed === origin;
  });
}

function setCorsHeaders(res: VercelResponse, origin: string | undefined) {
  if (isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-supabase-auth');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;
  const origin = req.headers.origin;

  // Handle preflight requests
  if (method === 'OPTIONS') {
    setCorsHeaders(res, origin);
    res.status(200).end();
    return;
  }

  // Set CORS headers for actual requests
  setCorsHeaders(res, origin);

  // Handle GET request
  if (method === 'GET') {
    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'Blindspot Whisperer API is running',
      cors: {
        origin: origin || 'none',
        allowed: isOriginAllowed(origin)
      }
    });
  }

  // Method not allowed
  res.setHeader('Allow', ['GET', 'OPTIONS']);
  return res.status(405).json({ 
    error: 'Method Not Allowed',
    allowed: ['GET', 'OPTIONS']
  });
}