const mockContent = [
  {
    id: '1',
    title: 'Welcome to Blindspot Whisperer',
    content: 'This is a sample content item',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'API Connection Test',
    content: 'If you can see this, the API connection is working!',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

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
      content: mockContent,
      count: mockContent.length,
      message: 'Content retrieved successfully'
    });
  }

  if (req.method === 'POST') {
    const { title, content } = req.body || {};
    
    if (!title || !content) {
      return res.status(400).json({
        error: 'Title and content are required',
        received: { title: title ? 'provided' : 'missing', content: content ? 'provided' : 'missing' }
      });
    }

    const newContent = {
      id: String(mockContent.length + 1),
      title,
      content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockContent.push(newContent);

    return res.status(201).json({
      message: 'Content created successfully',
      content: newContent
    });
  }

  res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
  return res.status(405).json({ 
    error: 'Method Not Allowed',
    allowed: ['GET', 'POST', 'OPTIONS']
  });
}