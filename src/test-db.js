const { Client } = require('pg');

const connectionString = 'postgresql://postgres:123456@db.vbobpybekjauvtrllmep.supabase.co:5432/postgres';

async function testConnection() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Connecting to database...');
        await client.connect();
        console.log('Connected! Executing SELECT NOW()...');
        const res = await client.query('SELECT NOW()');
        console.log('Current Time from DB:', res.rows[0].now);
        console.log('✅ Connection confirmed working with provided credentials.');
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
    } finally {
        await client.end();
    }
}

testConnection();
