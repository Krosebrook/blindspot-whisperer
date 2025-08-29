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

// Mock stats data
function generateMockStats() {
  return {
    users: {
      total: 1247,
      active: 892,
      new_this_month: 156
    },
    content: {
      total_items: 3421,
      published: 2987,
      drafts: 434
    },
    activity: {
      daily_views: 15634,
      weekly_views: 89234,
      monthly_views: 342567
    },
    performance: {
      avg_response_time: '145ms',
      uptime: '99.9%',
      api_calls_today: 8792
    },
    last_updated: new Date().toISOString()
  };
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
    const stats = generateMockStats();
    
    return res.status(200).json({
      stats,
      message: 'Statistics retrieved successfully',
      generated_at: new Date().toISOString()
    });
  }

  // Method not allowed
  res.setHeader('Allow', ['GET', 'OPTIONS']);
  return res.status(405).json({ 
    error: 'Method Not Allowed',
    allowed: ['GET', 'OPTIONS']
  });
}