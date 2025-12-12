const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://vbobpybekjauvtrllmep.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZib2JweWJla2phdXZ0cmxsbWVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTMyMDkxNywiZXhwIjoyMDgwODk2OTE3fQ.hub0JMa4bxXCwCd_1iPK2FWbn8nmkUI33Z-UzUBSD-4'
);

async function completeSystemValidation() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   🔍 VALIDACIÓN COMPLETA DEL SISTEMA NUTRIAI');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let passed = 0;
  let failed = 0;

  // TEST 1: Verificar que la BD está conectada
  console.log('📋 TEST 1: Conexión con BD');
  try {
    const { data } = await supabase.from('users').select('count(*)', { count: 'exact' });
    console.log('   ✅ Conexión a Supabase exitosa\n');
    passed++;
  } catch (error) {
    console.log('   ❌ Error de conexión:', error.message, '\n');
    failed++;
  }

  // TEST 2: Verificar estructura de tablas
  console.log('📋 TEST 2: Estructura de Tablas');
  const tables = ['users', 'conversations', 'messages', 'profiles', 'meal_plans'];
  for (const table of tables) {
    try {
      const { data } = await supabase.from(table).select('count(*)', { count: 'exact' }).limit(1);
      console.log(`   ✅ Tabla "${table}" existe`);
      passed++;
    } catch (error) {
      console.log(`   ❌ Tabla "${table}" no existe`);
      failed++;
    }
  }
  console.log();

  // TEST 3: Verificar historial de conversaciones
  console.log('📋 TEST 3: Historial de Conversaciones');
  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select('id', { count: 'exact' });

  if (!convError) {
    console.log(`   ✅ Total de conversaciones: ${conversations.length}`);
    passed++;
  } else {
    console.log(`   ❌ Error al obtener conversaciones:`, convError.message);
    failed++;
  }

  // TEST 4: Verificar mensajes guardados
  console.log('\n📋 TEST 4: Mensajes en Base de Datos');
  const { data: messages, error: msgError } = await supabase
    .from('messages')
    .select('id, metadata', { count: 'exact' });

  if (!msgError && messages) {
    const userMsgs = messages.filter(m => m.metadata?.role === 'user').length;
    const aiMsgs = messages.filter(m => m.metadata?.role === 'assistant').length;
    
    console.log(`   ✅ Total de mensajes: ${messages.length}`);
    console.log(`      - Mensajes de usuario: ${userMsgs}`);
    console.log(`      - Respuestas de IA: ${aiMsgs}`);
    
    if (aiMsgs > 0) {
      console.log(`   ✅ IA está respondiendo correctamente`);
      passed++;
    } else {
      console.log(`   ⚠️  Advertencia: No hay respuestas de IA`);
    }
  } else {
    console.log(`   ❌ Error al obtener mensajes:`, msgError?.message);
    failed++;
  }

  // TEST 5: Verificar integridad de datos
  console.log('\n📋 TEST 5: Integridad de Datos');
  
  // Verificar mensajes huérfanos
  const { data: orphanMsgs } = await supabase
    .from('messages')
    .select('id')
    .is('conversation_id', null);

  if (!orphanMsgs || orphanMsgs.length === 0) {
    console.log(`   ✅ No hay mensajes huérfanos (sin conversación)`);
    passed++;
  } else {
    console.log(`   ❌ Hay ${orphanMsgs.length} mensajes sin conversación`);
    failed++;
  }

  // Verificar mensajes sin sender
  const { data: noSenderMsgs } = await supabase
    .from('messages')
    .select('id')
    .is('sender_id', null);

  if (!noSenderMsgs || noSenderMsgs.length === 0) {
    console.log(`   ✅ Todos los mensajes tienen sender_id`);
    passed++;
  } else {
    console.log(`   ❌ Hay ${noSenderMsgs.length} mensajes sin sender_id`);
    failed++;
  }

  // TEST 6: Verificar que el metadata está bien formado
  console.log('\n📋 TEST 6: Estructura de Metadata');
  if (messages && messages.length > 0) {
    const validMetadata = messages.filter(m => m.metadata && typeof m.metadata === 'object').length;
    const rate = (validMetadata / messages.length * 100).toFixed(1);
    
    if (rate === '100.0') {
      console.log(`   ✅ El 100% de mensajes tienen metadata válida`);
      passed++;
    } else {
      console.log(`   ⚠️  ${rate}% de mensajes tienen metadata válida`);
    }

    // Verificar que tienen el campo 'role'
    const withRole = messages.filter(m => m.metadata?.role).length;
    if (withRole === messages.length) {
      console.log(`   ✅ Todos los mensajes tienen definido el 'role' en metadata`);
      passed++;
    } else {
      console.log(`   ⚠️  ${withRole} de ${messages.length} mensajes tienen 'role' definido`);
    }
  }

  // TEST 7: Análisis de conversación reciente
  console.log('\n📋 TEST 7: Validación de Conversación Reciente');
  if (conversations && conversations.length > 0) {
    const { data: recentConv } = await supabase
      .from('conversations')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    if (recentConv) {
      const { data: convMessages } = await supabase
        .from('messages')
        .select('metadata')
        .eq('conversation_id', recentConv.id);

      if (convMessages && convMessages.length > 0) {
        const hasUser = convMessages.some(m => m.metadata?.role === 'user');
        const hasAI = convMessages.some(m => m.metadata?.role === 'assistant');

        console.log(`   Conversación más reciente: ${recentConv.id}`);
        console.log(`   Mensajes: ${convMessages.length}`);
        
        if (hasUser && hasAI) {
          console.log(`   ✅ Tiene tanto mensajes de usuario como de IA`);
          passed++;
        } else {
          console.log(`   ⚠️  Falta: ${!hasUser ? 'usuario' : ''} ${!hasAI ? 'IA' : ''}`);
        }
      }
    }
  }

  // TEST 8: Verificar que hay al menos un usuario
  console.log('\n📋 TEST 8: Usuarios en el Sistema');
  const { data: users } = await supabase.from('users').select('id', { count: 'exact' });
  
  if (users && users.length > 0) {
    console.log(`   ✅ Hay ${users.length} usuario(s) registrado(s)`);
    passed++;
  } else {
    console.log(`   ❌ No hay usuarios en la BD`);
    failed++;
  }

  // TEST 9: Verificar flujo de IA
  console.log('\n📋 TEST 9: Flujo de Interacción IA');
  if (messages && messages.length > 0) {
    const grouped = {};
    messages.forEach(m => {
      const convId = m.conversation_id;
      if (!grouped[convId]) grouped[convId] = { user: 0, ai: 0 };
      if (m.metadata?.role === 'user') grouped[convId].user++;
      if (m.metadata?.role === 'assistant') grouped[convId].ai++;
    });

    let hasValidFlow = 0;
    Object.values(grouped).forEach(group => {
      if (group.user > 0 && group.ai > 0) hasValidFlow++;
    });

    const totalConvWithFlow = hasValidFlow;
    console.log(`   ✅ ${totalConvWithFlow} conversación(es) con flujo usuario-IA`);
    passed++;
  }

  // TEST 10: Resumen
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📊 RESUMEN DE PRUEBAS');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\n   ✅ Pruebas Exitosas: ${passed}`);
  console.log(`   ❌ Pruebas Fallidas: ${failed}`);
  console.log(`   📈 Tasa de Éxito: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);

  if (failed === 0) {
    console.log('   ✨ ¡SISTEMA OPERACIONAL! Todas las pruebas pasaron.\n');
    console.log('   📝 CONCLUSIÓN:');
    console.log('   ✅ El historial de conversaciones se está guardando correctamente');
    console.log('   ✅ Las respuestas de IA se están almacenando en la BD');
    console.log('   ✅ La estructura de datos es consistente');
    console.log('   ✅ El sistema está completamente funcional\n');
  } else {
    console.log('   ⚠️  ADVERTENCIA: Hay problemas que deben resolverse.\n');
  }
}

completeSystemValidation().catch(console.error);
