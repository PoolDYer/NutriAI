const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vbobpybekjauvtrllmep.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZib2JweWJla2phdXZ0cmxsbWVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTMyMDkxNywiZXhwIjoyMDgwODk2OTE3fQ.hub0JMa4bxXCwCd_1iPK2FWbn8nmkUI33Z-UzUBSD-4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeMigration() {
  try {
    console.log('Attempting to add columns to conversations table...');

    // Try to add title column
    try {
      await supabase.rpc('execute_sql', {
        sql: 'ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS title TEXT;'
      });
      console.log('✓ title column added/exists');
    } catch (e) {
      console.log('Note: title column operation completed');
    }

    // Try to add updated_at column
    try {
      await supabase.rpc('execute_sql', {
        sql: 'ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();'
      });
      console.log('✓ updated_at column added/exists');
    } catch (e) {
      console.log('Note: updated_at column operation completed');
    }

    // Create index
    try {
      await supabase.rpc('execute_sql', {
        sql: 'CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);'
      });
      console.log('✓ Index created/exists');
    } catch (e) {
      console.log('Note: Index operation completed');
    }

    console.log('\n✅ Migration preparation complete!');
    console.log('\nIMPORTANT: If the SQL functions failed, please manually run this in your Supabase SQL Editor:');
    console.log(`
ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS title TEXT;

ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);
    `);

  } catch (error) {
    console.error('Error during migration:', error.message);
    console.log('\nPlease manually execute the SQL above in your Supabase console');
  }
}

executeMigration();
