const { Client } = require('pg');

const connectionString = 'postgresql://postgres:123456@db.vbobpybekjauvtrllmep.supabase.co:5432/postgres';

async function listTables() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);

        if (res.rows.length === 0) {
            console.log('⚠️  No tables found in public schema.');
        } else {
            console.log('✅ Found tables:');
            res.rows.forEach(row => console.log(` - ${row.table_name}`));
        }

    } catch (err) {
        console.error('❌ Query failed:', err.message);
    } finally {
        await client.end();
    }
}

listTables();
