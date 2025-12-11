const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase credentials from the conversations controller
const supabaseUrl = 'https://vbobpybekjauvtrllmep.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZib2JweWJla2phdXZ0cmxsbWVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTMyMDkxNywiZXhwIjoyMDgwODk2OTE3fQ.hub0JMa4bxXCwCd_1iPK2FWbn8nmkUI33Z-UzUBSD-4';

async function migrate() {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        console.log('Reading schema file...');
        const schemaPath = path.join(__dirname, '../supabase_schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema migration via Supabase SQL...');

        // Use Supabase's RPC to execute raw SQL
        // Note: This requires the service role key and proper permissions
        const { data, error } = await supabase.rpc('exec_sql', {
            sql_query: schemaSql
        });

        if (error) {
            console.error('Migration failed via RPC:', error);
            console.log('\n⚠️  RPC method not available. Trying alternative approach...\n');

            // Alternative: Split and execute statements individually
            await executeSqlStatements(supabase, schemaSql);
        } else {
            console.log('✅ Migration completed successfully!');
            console.log('Response:', data);
        }

    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        console.log('\n📝 MANUAL MIGRATION REQUIRED:');
        console.log('Please execute the SQL schema manually in Supabase Dashboard:');
        console.log('1. Go to: https://supabase.com/dashboard/project/vbobpybekjauvtrllmep/editor');
        console.log('2. Open SQL Editor');
        console.log('3. Copy and paste the contents of supabase_schema.sql');
        console.log('4. Click "Run" to execute the schema\n');
    }
}

async function executeSqlStatements(supabase, sql) {
    console.log('Attempting to execute SQL statements individually...');

    // This is a simplified approach - in production you'd want better SQL parsing
    const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.length < 10) continue; // Skip very short statements

        console.log(`Executing statement ${i + 1}/${statements.length}...`);

        try {
            // Try to execute via RPC if available
            const { error } = await supabase.rpc('exec_sql', {
                sql_query: statement + ';'
            });

            if (error) {
                console.warn(`⚠️  Statement ${i + 1} failed:`, error.message);
            }
        } catch (err) {
            console.warn(`⚠️  Statement ${i + 1} error:`, err.message);
        }
    }

    console.log('\n✅ Attempted to execute all statements');
    console.log('⚠️  Some statements may have failed - please verify in Supabase Dashboard');
}

migrate();
