const http = require('http');

function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = data ? JSON.parse(data) : {};
                    resolve({ status: res.statusCode, body: json });
                } catch (e) {
                    console.error('Failed to parse JSON:', data);
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', (e) => reject(e));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function testApiFlow() {
    try {
        console.log('1. Creating Conversation...');
        // We'll use a hardcoded patientId 'me' which the controller handles by finding a demo user
        const convRes = await request('POST', '/conversations', { patientId: 'me' });

        if (convRes.status !== 201) {
            console.error('Failed to create conversation:', convRes.body);
            return;
        }

        const convId = convRes.body.id;
        console.log('   Conversation ID:', convId);

        console.log('2. Sending Message "Hello NutriAI"...');
        const msgRes = await request('POST', `/conversations/${convId}/messages`, {
            content: 'Hello NutriAI, what is a healthy breakfast?'
        });

        if (msgRes.status !== 201) {
            console.error('Failed to send message:', msgRes.body);
            return;
        }
        console.log('   Message Sent. User Msg ID:', msgRes.body.id);

        console.log('   (Waiting 2s for AI to potentially finish saving if async - though controller waits)');
        await new Promise(r => setTimeout(r, 2000));

        console.log('3. Fetching Messages...');
        const getRes = await request('GET', `/conversations/${convId}/messages`);

        if (getRes.status !== 200) {
            console.error('Failed to get messages:', getRes.body);
            return;
        }

        const messages = getRes.body;
        console.log(`   Retrieved ${messages.length} messages.`);

        messages.forEach(m => {
            const role = m.metadata?.role || m.role || 'unknown';
            console.log(`   - [${role}] ${m.content.substring(0, 50)}...`);
        });

        const hasAI = messages.some(m => (m.metadata?.role === 'assistant' || m.role === 'assistant'));
        if (hasAI) {
            console.log('✅ AI Response Found!');
        } else {
            console.log('⚠️  No AI Response found. Check AI Service logs.');
        }

    } catch (err) {
        console.error('Test Failed:', err);
    }
}

testApiFlow();
