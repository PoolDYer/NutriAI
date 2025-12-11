const https = require('https');

const apiKey = 'AIzaSyCFV73GS4A0ZPd409zv_ny-iBvyeOD5_4s';
const model = 'gemini-pro';

function testV1() {
    console.log('Testing v1 API...');

    // Using /v1/ instead of /v1beta/
    const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1/models/${model}:generateContent?key=${apiKey}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    };

    const data = JSON.stringify({
        contents: [{ parts: [{ text: "Hello" }] }]
    });

    const req = https.request(options, (res) => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => {
            console.log('Status:', res.statusCode);
            if (res.statusCode === 200) console.log('✅ Success v1!');
            else console.log('❌ Failed v1', body);
        });
    });

    req.write(data);
    req.end();
}

testV1();
