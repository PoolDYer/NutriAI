const https = require('https');

const apiKey = 'AIzaSyCFV73GS4A0ZPd409zv_ny-iBvyeOD5_4s';
const candidates = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-001',
    'gemini-1.5-pro',
    'gemini-pro',
    'gemini-1.0-pro'
];

async function checkModel(model) {
    return new Promise(resolve => {
        const data = JSON.stringify({
            contents: [{ parts: [{ text: "Hi" }] }]
        });

        const req = https.request({
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, (res) => {
            if (res.statusCode === 200) {
                console.log(`✅ ${model} WORKS!`);
                resolve(model);
            } else {
                console.log(`❌ ${model} failed (${res.statusCode})`);
                resolve(null);
            }
        });

        req.on('error', () => resolve(null));
        req.write(data);
        req.end();
    });
}

async function runTests() {
    console.log('Testing models...');
    for (const m of candidates) {
        const result = await checkModel(m);
        if (result) return; // Stop at first working one
    }
    console.log('All tests finished.');
}

runTests();
