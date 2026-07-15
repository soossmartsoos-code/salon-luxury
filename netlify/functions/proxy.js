exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const params = new URLSearchParams(event.queryStringParameters || {});
    const path = params.get('path');
    const method = params.get('method') || event.httpMethod || 'GET';

    if (!path) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing path' }) };
    }

    let requestBody = null;
    if (event.body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      try {
        requestBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      } catch (e) {
        requestBody = event.body;
      }
    }

    const firebaseUrl = `https://salon-luxury-1b55b-default-rtdb.europe-west1.firebasedatabase.app${path}.json`;

    const fetchOptions = {
      method: method.toUpperCase(),
      headers: { 'Content-Type': 'application/json' },
    };

    if (requestBody && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      fetchOptions.body = typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody);
    }

    const response = await fetch(firebaseUrl, fetchOptions);
    const data = await response.text();

    let jsonData;
    try { jsonData = JSON.parse(data); } catch (e) { jsonData = data; }

    return { statusCode: response.status, headers, body: JSON.stringify(jsonData) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
