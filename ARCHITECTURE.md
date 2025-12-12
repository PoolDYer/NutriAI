# 🏗️ NutriAI - Arquitectura Completa

## Diagrama de Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (React 5173)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐      ┌──────────────────┐                 │
│  │  AuthForms.jsx   │      │   DashboardLayout│                 │
│  │  - Login         │      │   - Sidebar      │                 │
│  │  - Register      │      │   - Chat Window  │                 │
│  │  - Demo Mode     │      │   - Profile      │                 │
│  └────────┬─────────┘      └────────┬─────────┘                 │
│           │                         │                            │
│           │                    ┌────▼──────────────┐             │
│           │                    │ ChatWindow.jsx    │             │
│           │                    │ - Messages        │             │
│           │                    │ - Input           │             │
│           │                    │ - AI Typing       │             │
│           │                    └────┬─────────────┘             │
│           │                         │                            │
│           │              ┌──────────▼──────────────┐             │
│           │              │ConversationSidebar.jsx │             │
│           │              │ - Listado conversaciones│             │
│           │              │ - Búsqueda             │             │
│           │              └──────────┬──────────────┘             │
│           │                         │                            │
│           │            ┌────────────▼─────────────┐             │
│           │            │   React Query (State)    │             │
│           │            │ - Polling cada 5 seg     │             │
│           │            │ - Cache management       │             │
│           │            │ - Mutations              │             │
│           └────────────┴────────────┬─────────────┘             │
│                                     │                            │
└─────────────────────────────────────┼────────────────────────────┘
                                      │
                    ┌─────────────────▼──────────────┐
                    │     API CALLS (HTTP REST)      │
                    │ ┌──────────────────────────────┤
                    │ │ POST /conversations          │
                    │ │ POST /conversations/:id/msg  │
                    │ │ GET /conversations           │
                    │ │ PATCH /conversations/:id     │
                    │ │ GET /conversations/:id/msg   │
                    │ │ POST /auth/login             │
                    │ │ POST /auth/register          │
                    │ └──────────────────────────────┤
                    └────────────────┬────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────┐
│                  SERVIDOR (NestJS 3000)                         │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              ConversationsController                 │      │
│  │  - GET /conversations           (Lista con enrich)  │      │
│  │  - POST /conversations          (Crear nueva)       │      │
│  │  - PATCH /conversations/:id     (Update título)     │      │
│  │  - GET /conversations/:id/messages (Historial)      │      │
│  │  - POST /conversations/:id/messages                 │      │
│  │    └─► Guarda mensaje                              │      │
│  │    └─► Llama AiService.generateResponse()           │      │
│  │    └─► Retorna mensaje al cliente                   │      │
│  └──────────────────┬───────────────────────────────────┘      │
│                     │                                            │
│  ┌──────────────────▼──────────────────────────────────┐      │
│  │            AiService (ai.service.ts)                │      │
│  │  - generateResponse(userId, convId, message)        │      │
│  │    1. Fetch historial (últimos 10 msgs)            │      │
│  │    2. Formatea para Gemini (usuario + rol)         │      │
│  │    3. Llama callLLMProvider()                        │      │
│  │    4. Guarda respuesta en BD                        │      │
│  │    5. Retorna AIResponse                            │      │
│  └──────────────────┬───────────────────────────────────┘      │
│                     │                                            │
│  ┌──────────────────▼──────────────────────────────────┐      │
│  │         AuthController (auth.controller.ts)         │      │
│  │  - POST /auth/register                             │      │
│  │  - POST /auth/login                                │      │
│  │  - POST /auth/refresh                              │      │
│  │  - POST /auth/verify-email                         │      │
│  └──────────────────┬───────────────────────────────────┘      │
│                     │                                            │
│  ┌──────────────────▼──────────────────────────────────┐      │
│  │   MealPlansController (meal-plans.controller.ts)    │      │
│  │  - GET /meal-plans     (Listar)                    │      │
│  │  - POST /meal-plans    (Crear)                     │      │
│  │  - GET /meal-plans/:id (Obtener)                   │      │
│  │  - PUT /meal-plans/:id (Actualizar)                │      │
│  │  - DELETE /meal-plans/:id (Eliminar)               │      │
│  └──────────────────┬───────────────────────────────────┘      │
│                     │                                            │
│  ┌──────────────────▼──────────────────────────────────┐      │
│  │  SupabaseClient (inyección de dependencias)         │      │
│  │  - Conexión a BD                                    │      │
│  │  - Autenticación con JWT                           │      │
│  │  - CRUD operations                                 │      │
│  └──────────────────┬───────────────────────────────────┘      │
│                     │                                            │
└─────────────────────┼────────────────────────────────────────────┘
                      │
                      │ ┌─────────────────────────────┐
                      │ │ LLAMADA A GEMINI API        │
                      │ │ generativelanguage.googleapis.com
                      ▼ │ POST /:generateContent      │
    ┌─────────────────────────────────────────┐       │
    │  Google Gemini API (Cloud)              │       │
    │                                         │       │
    │  Model: gemini-2.5-flash               │       │
    │  - Recibe: mensaje + contexto          │       │
    │  - Procesa: con system instruction     │       │
    │  - Retorna: respuesta en español       │       └─────────┘
    │                                         │
    └─────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│        SUPABASE (Cloud Database + Auth)                       │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ PostgreSQL Database                                   │   │
│  │                                                       │   │
│  │  [users]              [conversations]                │   │
│  │  ├─ id (UUID)         ├─ id (UUID)                  │   │
│  │  ├─ email             ├─ patient_id (FK)            │   │
│  │  ├─ role              ├─ title (NEW!)               │   │
│  │  ├─ created_at        ├─ started_at                 │   │
│  │  └─ updated_at        ├─ updated_at (NEW!)          │   │
│  │                       ├─ status                      │   │
│  │                       └─ nutritionist_id             │   │
│  │                                                       │   │
│  │  [messages]           [profiles]                     │   │
│  │  ├─ id (UUID)         ├─ id (UUID)                  │   │
│  │  ├─ conversation_id   ├─ first_name                 │   │
│  │  ├─ sender_id         ├─ last_name                  │   │
│  │  ├─ content           ├─ age                        │   │
│  │  ├─ metadata (role)   ├─ weight_kg                  │   │
│  │  └─ created_at        └─ height_cm                  │   │
│  │                                                       │   │
│  │  [meal_plans]         [assignments]                  │   │
│  │  ├─ id (UUID)         ├─ id (UUID)                  │   │
│  │  ├─ patient_id        ├─ nutritionist_id            │   │
│  │  ├─ plan_data (JSONB) ├─ patient_id                 │   │
│  │  ├─ created_at        ├─ assigned_at                │   │
│  │  └─ updated_at        └─ active (bool)              │   │
│  │                                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Supabase Auth                                         │   │
│  │  - JWT token generation                              │   │
│  │  - Email verification                                │   │
│  │  - Password reset                                    │   │
│  │  - User management                                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## Flujo Detallado de Envío de Mensaje

```
USUARIO ESCRIBE Y PRESIONA ENTER
│
├─► Frontend: ChatWindow.jsx
│   ├─ Captura texto del input
│   ├─ Valida que no esté vacío
│   └─ Llama: mutation.mutate({ content: "texto" })
│
├─► React Query Mutation
│   ├─ Optimistic Update: Agrega mensaje local
│   ├─ HTTP POST /conversations/:id/messages
│   └─ Body: { content: "¿Cómo bajo de peso?" }
│
├─► Backend: ConversationsController.addMessage()
│   ├─ Valida userId
│   ├─ Valida contenido
│   ├─ INSERT en tabla messages
│   │   └─ conversation_id, sender_id, content, metadata: { role: 'user' }
│   │
│   ├─ LLAMA AiService.generateResponse()
│   │   │
│   │   ├─► AI Service
│   │   │   ├─ SELECT últimos 10 mensajes de la conversación
│   │   │   ├─ Formatea para Gemini:
│   │   │   │   ├─ [{ role: 'user', parts: [{ text: "anterior" }] }, ...]
│   │   │   │   └─ [{ role: 'model', parts: [{ text: "respuesta" }] }, ...]
│   │   │   │
│   │   │   ├─ POST a Google Gemini API
│   │   │   │   ├─ URL: generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
│   │   │   │   ├─ Params: contents (historial), systemInstruction
│   │   │   │   └─ API Key: AIzaSyDDaqJhagrbOb33Y4K4CN0I81rUCLU-m3E
│   │   │   │
│   │   │   ├─ Gemini procesa y retorna respuesta
│   │   │   ├─ INSERT respuesta en messages
│   │   │   │   └─ role: 'assistant', content: "respuesta de gemini"
│   │   │   │
│   │   │   └─ Return AIResponse { reply_text: "..." }
│   │   │
│   │   └─► Backend continúa
│   │       ├─ Ha guardado 2 mensajes: usuario + asistente
│   │       └─ Retorna { data: userMsg }
│   │
│   ├─ ConversationsController retorna el mensaje del usuario
│   └─ HTTP 200 OK con mensaje guardado
│
├─► Frontend recibe respuesta
│   ├─ React Query invalida caché de mensajes
│   ├─ Trigger: refetchConversations() en DashboardLayout
│   └─ Espera polling (máximo 5 segundos)
│
├─► DashboardLayout Polling
│   ├─ GET /conversations (cada 5 seg)
│   ├─ Supabase retorna conversations enriquecidas:
│   │   ├─ Todas las conversaciones
│   │   ├─ Con lastMessage de cada una
│   │   ├─ Con updatedAt timestamp
│   │   └─ Ordenadas por más reciente
│   │
│   └─ React Query actualiza estado
│
├─► Frontend UI Update
│   ├─ Sidebar: Nueva conversación aparece
│   ├─ ChatWindow: GET /conversations/:id/messages
│   │   └─ Retorna todos los mensajes ordenados
│   └─ Interfaz se re-renderiza con ambos mensajes
│
└─► ¡Usuario ve respuesta de IA! ✨
```

---

## Stack de Tecnologías

### Frontend
```
React 18.2
  ├─ React Query 3.39 (State Management)
  ├─ Tailwind CSS 3.3 (Styling)
  ├─ Lucide React (Icons)
  ├─ React Markdown (Render AI)
  └─ Vite 4.4 (Build Tool)
```

### Backend
```
NestJS 9.0 (Framework)
  ├─ TypeScript (Language)
  ├─ @supabase/supabase-js (Client)
  ├─ Express (Server)
  └─ Reflection API
```

### Database & Auth
```
Supabase (PostgreSQL + Auth)
  ├─ PostgreSQL 14+
  ├─ Supabase Auth (JWT)
  ├─ Real-time subscriptions (Ready)
  └─ Storage (Ready)
```

### External APIs
```
Google Gemini API
  ├─ Model: gemini-2.5-flash
  ├─ Endpoint: generativelanguage.googleapis.com
  └─ Features: Text generation con contexto
```

---

## Mapeo de Responsabilidades

### Frontend (React)
- ✅ UI/UX
- ✅ Input/Output de usuario
- ✅ State Management (React Query)
- ✅ Validación de inputs
- ✅ Polling automático (5 seg)
- ✅ Optimistic updates

### Backend (NestJS)
- ✅ API REST
- ✅ Business Logic
- ✅ Llamadas a Gemini
- ✅ Persistencia en BD
- ✅ Autenticación/Autorización
- ✅ Manejo de errores

### Database (Supabase)
- ✅ Persistencia de datos
- ✅ Autenticación JWT
- ✅ ACID transactions
- ✅ Indexación
- ✅ RLS (Ready)

### AI (Gemini)
- ✅ Procesamiento de lenguaje natural
- ✅ Respuestas contextuales
- ✅ Especialización en nutrición

---

## Índices de Base de Datos (Optimizados)

```sql
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_conversations_updated_at ON public.conversations(updated_at DESC);
CREATE INDEX idx_conversations_patient_id ON public.conversations(patient_id);
CREATE INDEX idx_meal_plans_patient_id ON public.meal_plans(patient_id);
```

---

## Métricas de Rendimiento

| Operación | Tiempo Esperado | Nota |
|-----------|-----------------|------|
| Enviar mensaje | 2-5 seg | Incluye latencia Gemini |
| Cargar historial | <500ms | Desde caché o BD |
| Crear conversación | <100ms | BD + Retorno inmediato |
| Polling (5 seg) | <1000ms | GET conversaciones con últimos msgs |
| Respuesta Gemini | 2-4 seg | Depende de complejidad |
| Login/Registro | <500ms | Supabase Auth |

---

## Seguridad Implementada

- ✅ JWT Authentication (Supabase)
- ✅ HTTPS en producción
- ✅ SQL Injection Prevention (ORM Supabase)
- ✅ XSS Prevention (React + sanitization)
- ✅ CORS configurado
- ✅ Rate limiting (Ready en Supabase)
- ✅ Input validation (Frontend + Backend)
- ✅ API Key protection (Environment)

---

## Escalabilidad

### Horizontal Scaling
- Backend sin estado (stateless)
- Base de datos separada (Supabase)
- Frontend estático (Vite)
- Múltiples instancias posibles

### Vertical Scaling
- Índices en BD optimizados
- React Query caching
- Lazy loading de conversaciones
- Compresión gzip habilitada

---

**Diagrama creado el 12 de Diciembre de 2025**
