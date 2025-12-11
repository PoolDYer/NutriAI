const https = require('https');

const apiKey = 'AIzaSyCFV73GS4A0ZPd409zv_ny-iBvyeOD5_4s';
const model = 'gemini-2.5-flash';

function testFinal() {
    console.log(`Testing ${model}...`);

    // Note: The API URL format is /v1beta/models/{modelId}:generateContent
    // If the model name is 'models/gemini-1.5-flash-latest', the ID is 'gemini-1.5-flash-latest'
    const path = `/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
            console.log('\nStatus Code:', res.statusCode);
            if (res.statusCode === 200) {
                const json = JSON.parse(body);
                console.log('✅ Response:', json.candidates?.[0]?.content?.parts?.[0]?.text);
            } else {
                console.error('❌ Failed:', body);
            }
        });
    });

    req.write(JSON.stringify({ contents: [{ parts: [{ text: "Dame un desayuno saludable para ganar masa muscular" }] }] }));
    req.end();
}

testFinal();
