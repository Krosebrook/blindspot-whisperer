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

// Mock content data
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

  // Handle GET request - list content
  if (method === 'GET') {
    return res.status(200).json({
      content: mockContent,
      count: mockContent.length,
      message: 'Content retrieved successfully'
    });
  }

  // Handle POST request - create content
  if (method === 'POST') {
    const { title, content } = req.body;
    
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

  // Method not allowed
  res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
  return res.status(405).json({ 
    error: 'Method Not Allowed',
    allowed: ['GET', 'POST', 'OPTIONS']
  });
}