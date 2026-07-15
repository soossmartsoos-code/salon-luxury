module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Vary', '*');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { path, method = 'GET' } = req.query;
    
    if (!path) {
      return res.status(400).json({ error: 'Missing path parameter' });
    }

    // Manual body parsing for PATCH/POST/PUT (Vercel may not auto-parse for PATCH)
    let requestBody = req.body;
    if (!requestBody && req.method !== 'GET' && req.method !== 'HEAD') {
      const chunks = [];
      for await (const chunk of req) { chunks.push(chunk); }
      const raw = Buffer.concat(chunks).toString();
      if (raw) {
        try { requestBody = JSON.parse(raw); } catch (e) { requestBody = raw; }
      }
    }

    // Firebase Realtime Database REST API URL
    const firebaseUrl = `https://salon-luxury-1b55b-default-rtdb.europe-west1.firebasedatabase.app${path}.json`;
    
    // Prepare fetch options
    const fetchOptions = {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Add body for non-GET requests
    if (requestBody && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      fetchOptions.body = typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody);
    }

    // Make request to Firebase
    const response = await fetch(firebaseUrl, fetchOptions);
    const data = await response.text();
    
    // Try to parse as JSON, otherwise return as text
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (e) {
      jsonData = data;
    }

    // Return the response
    return res.status(response.status).json(jsonData);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      error: 'Proxy error',
      message: error.message
    });
  }
};