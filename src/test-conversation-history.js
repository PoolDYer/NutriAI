const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://vbobpybekjauvtrllmep.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZib2JweWJla2phdXZ0cmxsbWVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTMyMDkxNywiZXhwIjoyMDgwODk2OTE3fQ.hub0JMa4bxXCwCd_1iPK2FWbn8nmkUI33Z-UzUBSD-4'
);

async function analyzeConversationHistory() {
  console.log('🔍 ANALIZANDO HISTORIAL DE CONVERSACIONES\n');

  // 1. Obtener todas las conversaciones
  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select('id, patient_id, started_at, status')
    .order('started_at', { ascending: false });

  if (convError) {
    console.error('❌ Error al obtener conversaciones:', convError);
    return;
  }

  console.log(`✅ Total de conversaciones: ${conversations.length}\n`);

  // 2. Analizar cada conversación
  for (let i = 0; i < Math.min(conversations.length, 5); i++) {
    const conv = conversations[i];
    console.log(`\n📌 CONVERSACIÓN ${i + 1}`);
    console.log(`   ID: ${conv.id}`);
    console.log(`   Paciente: ${conv.patient_id}`);
    console.log(`   Iniciada: ${conv.started_at}`);
    console.log(`   Estado: ${conv.status}`);

    // 3. Obtener mensajes de esta conversación
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('id, sender_id, content, metadata, created_at')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: true });

    if (msgError) {
      console.error('   ❌ Error al obtener mensajes:', msgError);
      continue;
    }

    console.log(`   📨 Total de mensajes: ${messages.length}`);

    // Analizar estructura de mensajes
    messages.forEach((msg, idx) => {
      const role = msg.metadata?.role || 'unknown';
      const preview = msg.content.substring(0, 60).replace(/\n/g, ' ');
      console.log(`      [${idx + 1}] ${role}: "${preview}${msg.content.length > 60 ? '...' : ''}"`);
    });

    // Verificar si hay respuestas de IA
    const aiMessages = messages.filter(m => m.metadata?.role === 'assistant');
    if (aiMessages.length > 0) {
      console.log(`   ✅ IA respondió ${aiMessages.length} veces`);
    } else {
      console.log(`   ⚠️  Sin respuestas de IA`);
    }
  }

  // 4. Estadísticas generales
  console.log('\n\n📊 ESTADÍSTICAS GENERALES');
  const { data: allMessages } = await supabase
    .from('messages')
    .select('metadata');

  if (allMessages) {
    const userMsgs = allMessages.filter(m => m.metadata?.role === 'user').length;
    const aiMsgs = allMessages.filter(m => m.metadata?.role === 'assistant').length;

    console.log(`   👤 Mensajes de usuario: ${userMsgs}`);
    console.log(`   🤖 Mensajes de IA: ${aiMsgs}`);
    console.log(`   📝 Total de mensajes: ${allMessages.length}`);
    if (userMsgs > 0) {
      console.log(`   ➗ Ratio IA/Usuario: ${(aiMsgs / userMsgs).toFixed(2)}`);
    }
  }

  // 5. Verificar integridad de datos
  console.log('\n\n✔️ VERIFICACIÓN DE INTEGRIDAD');
  
  // Verificar que todos los mensajes tienen conversation_id válido
  const { data: orphanMessages } = await supabase
    .from('messages')
    .select('id')
    .filter('conversation_id', 'is', null);
  
  console.log(`   ✅ Mensajes huérfanos: ${orphanMessages?.length || 0}`);

  // Verificar que todos los mensajes tienen sender_id
  const { data: nosenderMessages } = await supabase
    .from('messages')
    .select('id')
    .filter('sender_id', 'is', null);

  console.log(`   ✅ Mensajes sin sender: ${nosenderMessages?.length || 0}`);

  // Verificar que hay usuarios en BD
  const { data: users } = await supabase.from('users').select('id');
  console.log(`   ✅ Usuarios en BD: ${users?.length || 0}`);

  console.log('\n\n✨ ANÁLISIS COMPLETADO');
}

analyzeConversationHistory().catch(console.error);
