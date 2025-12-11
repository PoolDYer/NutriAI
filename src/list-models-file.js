const https = require('https');
const fs = require('fs');

const apiKey = 'AIzaSyCFV73GS4A0ZPd409zv_ny-iBvyeOD5_4s';

function listModels() {
    console.log('Listing available Gemini models to file...');

    const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models?key=${apiKey}`,
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };

    const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
            fs.writeFileSync('models.json', body);
            console.log('Done writing models.json');
        });
    });

    req.on('error', (e) => {
        console.error('❌ Network Error:', e.message);
    });

    req.end();
}

listModels();
