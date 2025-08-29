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
    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'Blindspot Whisperer API is running',
      cors: {
        origin: origin || 'none',
        allowed: allowedOrigins.some(allowed => origin === allowed)
      }
    });
  }

  res.setHeader('Allow', ['GET', 'OPTIONS']);
  return res.status(405).json({ 
    error: 'Method Not Allowed',
    allowed: ['GET', 'OPTIONS']
  });
}