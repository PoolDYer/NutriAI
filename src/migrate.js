const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:123456@db.vbobpybekjauvtrllmep.supabase.co:5432/postgres';

async function migrate() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false } // Required for Supabase in some environments
    });

    try {
        console.log('Connecting to database...');
        await client.connect();

        const schemaPath = path.join(__dirname, '../supabase_schema.sql');
        console.log(`Reading schema from ${schemaPath}...`);
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema migration...');
        // Split by semicolons optionally or just wait for the whole block? 
        // Supabase SQL usually has functions/triggers that require careful splitting, 
        // but the provided schema is mostly CREATE TABLEs. Sending as one block usually works for CREATE extensions/tables.

        await client.query(schemaSql);

        console.log('Migration completed successfully!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
