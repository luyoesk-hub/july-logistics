// Quick API test
const http = require('http');

// Test GET request
const getOptions = {
  hostname: 'day12-starter-omega.vercel.app',
  port: 443,
  path: '/api/sales?limit=10&offset=0',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const testGet = () => {
  const req = http.request(getOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log('GET /api/sales Response:');
      console.log('Status:', res.statusCode);
      console.log('Body:', data);
    });
  });

  req.on('error', (e) => console.error('Error:', e));
  req.end();
};

testGet();
