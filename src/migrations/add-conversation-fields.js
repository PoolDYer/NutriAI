// Migration script to add title and updated_at fields to conversations table
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vbobpybekjauvtrllmep.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZib2JweWJla2phdXZ0cmxsbWVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTMyMDkxNywiZXhwIjoyMDgwODk2OTE3fQ.hub0JMa4bxXCwCd_1iPK2FWbn8nmkUI33Z-UzUBSD-4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrate() {
  try {
    console.log('Running migration: Adding title and updated_at to conversations table...');

    // First, check if columns already exist
    const { data: columnData, error: checkError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'conversations')
      .in('column_name', ['title', 'updated_at']);

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 means query returned 0 rows, which is fine
      console.log('Columns check:', checkError);
    }

    // Execute raw SQL to add columns if they don't exist
    // Since Supabase client doesn't expose raw SQL directly through the JS client,
    // we'll use the SQL function approach or document that this needs to be run manually

    console.log(`
    Please run the following SQL in your Supabase console:

    -- Add title column if it doesn't exist
    ALTER TABLE public.conversations
    ADD COLUMN IF NOT EXISTS title TEXT;

    -- Add updated_at column if it doesn't exist
    ALTER TABLE public.conversations
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

    -- Create index on updated_at for better performance
    CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);
    `);

    console.log('\nMigration guide complete. Please execute the SQL above manually in Supabase.');

  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrate();
