export default async function handler(req: any, res: any) {
  // Enable CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.json ? res.json({ error: 'Method not allowed' }) : res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const { password } = body || {};
  const trimmed = String(password || '').trim();

  // Accept passcodes 3237900 and 3247900
  if (trimmed === '3237900' || trimmed === '3247900') {
    const responsePayload = {
      success: true,
      token: 'admin-token-' + Date.now(),
      user: {
        email: 'admin@maseno.ac.ke',
        name: 'Jacinta Akinyi Owino',
        role: 'admin',
      },
    };
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.json ? res.json(responsePayload) : res.end(JSON.stringify(responsePayload));
  }

  const errorPayload = { error: 'Incorrect passcode.' };
  res.statusCode = 401;
  res.setHeader('Content-Type', 'application/json');
  return res.json ? res.json(errorPayload) : res.end(JSON.stringify(errorPayload));
}
