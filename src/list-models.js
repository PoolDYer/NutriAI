const https = require('https');

const apiKey = 'AIzaSyCFV73GS4A0ZPd409zv_ny-iBvyeOD5_4s';

function listModels() {
    console.log('Listing available Gemini models...');

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
            console.log('\nStatus Code:', res.statusCode);
            try {
                const json = JSON.parse(body);
                if (res.statusCode === 200) {
                    console.log('✅ Models found:');
                    json.models?.forEach(m => {
                        // Print just the name, strip 'models/' prefix for clarity if present
                        console.log(m.name.replace('models/', ''));
                    });
                } else {
                    console.error('❌ API Error:', JSON.stringify(json, null, 2));
                }
            } catch (e) {
                console.error('Response (raw):', body);
            }
        });
    });

    req.on('error', (e) => {
        console.error('❌ Network Error:', e.message);
    });

    req.end();
}

listModels();
