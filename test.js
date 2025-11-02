const http = require('http');

const options = { hostname: 'localhost', port: 3000, path: '/health', method: 'GET' };

const req = http.request(options, res => {
  let data='';
  res.on('data', chunk => data+=chunk);
  res.on('end', () => {
    try {
      const j = JSON.parse(data);
      if(j.status==='ok') {
        console.log('TEST_PASS'); process.exit(0);
      } else { console.error('TEST_FAIL'); process.exit(1); }
    } catch(e) { console.error('TEST_FAIL'); process.exit(1); }
  });
});

req.on('error', (e)=> { console.error(e); process.exit(1); });
req.end();
