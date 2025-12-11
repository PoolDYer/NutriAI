const { Client } = require('pg');

const connectionString = 'postgresql://postgres:123456@db.vbobpybekjauvtrllmep.supabase.co:5432/postgres';

async function testInsert() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        console.log('📝 Attempting to insert test user...');
        // This should fail due to FK constraint on auth.users if the DB is set up correctly
        const res = await client.query(`
            INSERT INTO public.users (id, email, role) 
            VALUES ('00000000-0000-0000-0000-000000000000', 'test@example.com', 'patient')
        `);
        console.log('✅ Insert unexpected success (maybe constraints missing?)');

    } catch (err) {
        if (err.code === '23503') { // Foreign key violation
            console.log('✅ Insert failed as expected (Foreign Key Constraint enforced):');
            console.log(`   ${err.detail}`);
            console.log('   This confirms WRITE access is working and Schema constraints are active.');
        } else {
            console.error('❌ Insert failed with unexpected error:', err.message);
            console.error('Code:', err.code);
        }
    } finally {
        await client.end();
    }
}

testInsert();
