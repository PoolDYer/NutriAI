const https = require('https');

// Key found in src/ai/ai.service.ts
const apiKey = 'e1dbd92dadfc4e0b8b8f67aaf8a83412.AtYMtXk1mYW3ERVvHfFq_5WW';
const model = 'llama-3.2-3b-preview';

function testGroq() {
    console.log('Testing Groq API connection...');
    console.log('Model:', model);
    console.log('Key (masked):', apiKey.substring(0, 5) + '...');

    const data = JSON.stringify({
        model: model,
        messages: [
            { role: 'user', content: 'Say hello' }
        ]
    });

    const options = {
        hostname: 'api.groq.com',
        path: '/openai/v1/chat/completions',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        }
    };

    const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
            console.log('\nStatus Code:', res.statusCode);
            try {
                const json = JSON.parse(body);
                if (res.statusCode === 200) {
                    console.log('✅ Success! Response:', json.choices[0].message.content);
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

    req.write(data);
    req.end();
}

testGroq();
