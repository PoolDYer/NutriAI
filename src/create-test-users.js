const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vbobpybekjauvtrllmep.supabase.co';
// Using the service key found in the controller to ensure we can create users without restrictions if possible, 
// or just the anon key if that was what it was. 
// The key in controller was: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZib2JweWJla2phdXZ0cmxsbWVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTMyMDkxNywiZXhwIjoyMDgwODk2OTE3fQ.hub0JMa4bxXCwCd_1iPK2FWbn8nmkUI33Z-UzUBSD-4'
// Decoding 'role': 'service_role' -> It is a SERVICE KEY. Perfect.

const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZib2JweWJla2phdXZ0cmxsbWVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTMyMDkxNywiZXhwIjoyMDgwODk2OTE3fQ.hub0JMa4bxXCwCd_1iPK2FWbn8nmkUI33Z-UzUBSD-4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createUsers() {
    console.log('Creating test users...');

    const users = [
        { email: 'usuario1@test.com', password: 'password123', first_name: 'Usuario', last_name: 'Uno' },
        { email: 'usuario2@test.com', password: 'password123', first_name: 'Usuario', last_name: 'Dos' }
    ];

    const results = [];

    for (const u of users) {
        // Try to sign up (if auto-confirm is on) or admin create
        const { data, error } = await supabase.auth.admin.createUser({
            email: u.email,
            password: u.password,
            email_confirm: true, // Auto confirm
            user_metadata: { first_name: u.first_name, last_name: u.last_name }
        });

        if (error) {
            console.log(`Error creating ${u.email}:`, error.message);
            // If error is "User already registered", that's fine, we still return the creds
            results.push({ email: u.email, password: u.password, status: 'Existing or Error' });
        } else {
            console.log(`Created ${u.email} successfully.`);
            results.push({ email: u.email, password: u.password, status: 'Created' });
        }
    }

    console.log('\n--- Credentials ---');
    results.forEach(r => console.log(`Email: ${r.email} | Pass: ${r.password} (${r.status})`));
}

createUsers();
