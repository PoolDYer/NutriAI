const { Client } = require('pg');

const connectionString = 'postgresql://postgres:123456@db.vbobpybekjauvtrllmep.supabase.co:5432/postgres';

async function checkCounts() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        const tables = ['users', 'profiles', 'conversations', 'messages'];

        console.log('📊 Checking row counts:');
        for (const table of tables) {
            const res = await client.query(`SELECT COUNT(*) FROM public.${table}`);
            console.log(` - ${table}: ${res.rows[0].count} rows`);
        }

    } catch (err) {
        console.error('❌ Query failed:', err.message);
    } finally {
        await client.end();
    }
}

checkCounts();
