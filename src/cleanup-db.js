const { Client } = require('pg');

const connectionString = 'postgresql://postgres:123456@db.vbobpybekjauvtrllmep.supabase.co:5432/postgres';

async function cleanup() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        console.log('🧹 Cleaning up test user...');
        const res = await client.query(`
            DELETE FROM public.users 
            WHERE id = '00000000-0000-0000-0000-000000000000'
        `);
        console.log(`✅ Deleted ${res.rowCount} row(s).`);

    } catch (err) {
        console.error('❌ Cleanup failed:', err.message);
    } finally {
        await client.end();
    }
}

cleanup();
