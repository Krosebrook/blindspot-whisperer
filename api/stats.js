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

export default function handler(req, res) {
  // Enable CORS for Loveable.dev
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://lovable.dev',
    'https://3eaf1426-02df-4dda-ba61-f872c068de46.lovable.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ];

  if (allowedOrigins.some(allowed => allowed.includes('lovable.dev') || origin === allowed)) {
    res.setHeader('Access-Control-Allow-Origin', origin || 'https://lovable.dev');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-supabase-auth');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const stats = generateMockStats();
    
    return res.status(200).json({
      stats,
      message: 'Statistics retrieved successfully',
      generated_at: new Date().toISOString()
    });
  }

  res.setHeader('Allow', ['GET', 'OPTIONS']);
  return res.status(405).json({ 
    error: 'Method Not Allowed',
    allowed: ['GET', 'OPTIONS']
  });
}