const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vbobpybekjauvtrllmep.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZib2JweWJla2phdXZ0cmxsbWVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTMyMDkxNywiZXhwIjoyMDgwODk2OTE3fQ.hub0JMa4bxXCwCd_1iPK2FWbn8nmkUI33Z-UzUBSD-4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testStructure() {
    try {
        console.log('1. Creating a test user...');
        // Need a user to create conversion message
        // Inserting directly to avoid auth/controller complexity for this quick test
        const testUser = {
            id: '11111111-1111-1111-1111-111111111111',
            email: 'structure-test@example.com',
            role: 'patient'
        };

        // Upsert user to ensure it exists
        await supabase.from('users').upsert(testUser);

        console.log('2. Creating a test conversation...');
        const { data: conv, error: convError } = await supabase
            .from('conversations')
            .insert({ patient_id: testUser.id, status: 'active' })
            .select()
            .single();

        if (convError) throw convError;
        console.log('   Conversation ID:', conv.id);

        console.log('3. Inserting a test message...');
        const { data: msg, error: msgError } = await supabase
            .from('messages')
            .insert({
                conversation_id: conv.id,
                sender_id: testUser.id,
                content: 'Hello World',
                metadata: { role: 'user' }
            })
            .select()
            .single();

        if (msgError) throw msgError;

        console.log('4. Fetching the message back (simulating GET /messages)...');
        const { data: fetchedMessages } = await supabase
            .from('messages')
            .select('*')
            .eq('id', msg.id);

        console.log('\n--- FETCHED JSON STRUCTURE ---');
        console.log(JSON.stringify(fetchedMessages[0], null, 2));
        console.log('------------------------------\n');

        if (fetchedMessages[0].role === undefined && fetchedMessages[0].metadata?.role === 'user') {
            console.log('⚠️  CONFIRMED: "role" is in "metadata", not at root. Frontend needs fixing.');
        } else {
            console.log('? Structure might be different than expected.');
        }

        // Cleanup
        await supabase.from('conversations').delete().eq('id', conv.id);
        await supabase.from('users').delete().eq('id', testUser.id);

    } catch (err) {
        console.error('Test failed:', err);
    }
}

testStructure();
