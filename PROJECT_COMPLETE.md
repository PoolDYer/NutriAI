# 🥗 NutriAI - Chat Personalizado de Nutrición con IA

Plataforma completa de asesoría nutricional impulsada por inteligencia artificial (Gemini) con historial de conversaciones persistente, autenticación Supabase y chat en tiempo real.

## ✨ Características Principales

### 🤖 IA Especializada en Nutrición
- **Gemini 2.5 Flash**: Motor IA de última generación
- **Sistema de Prompts Especializado**: Responde solo en español
- **Contexto de Conversación**: Mantiene historial para respuestas coherentes
- **Recomendaciones Personalizadas**: Basadas en ingredientes locales y accesibles

### 💬 Chat Avanzado
- **Mensajes en Tiempo Real**: Interfaz responsive y moderna
- **Historial Persistente**: Todas las conversaciones se guardan automáticamente
- **Guardado Automático de Títulos**: Primer mensaje como título de conversación
- **Sincronización Automática**: Actualización cada 5 segundos del sidebar

### 👤 Autenticación & Seguridad
- **Supabase Auth**: Registro e inicio de sesión seguros
- **Token JWT**: Autenticación basada en tokens
- **Demo Mode**: Botón Skip para pruebas rápidas
- **Protección de Rutas**: Validación en frontend y backend

### 📱 Interfaz Moderna
- **Diseño Responsive**: Funciona en desktop y móvil
- **Tailwind CSS**: Estilos profesionales y consistentes
- **Iconografía Lucide**: Icons limpios y modernos
- **Sidebar Desplegable**: Navegación optimizada para móvil

### 📊 Gestión de Conversaciones
- **Listado de Conversaciones**: Panel lateral con historial completo
- **Búsqueda**: (Preparado para filtrar conversaciones)
- **Ordenamiento Inteligente**: Por fecha de actualización (más reciente primero)
- **Vista Previa**: Último mensaje visible en cada conversación

## 🏗️ Arquitectura

### Stack Tecnológico

**Frontend:**
- React 18.2
- Vite 4.4
- React Query 3.39 (State Management)
- Tailwind CSS 3.3
- Lucide React (Icons)
- React Markdown (Renderizado de contenido IA)

**Backend:**
- NestJS 9.0 (Framework)
- TypeScript
- Supabase Client
- PostgreSQL (via Supabase)

**Autenticación & Database:**
- Supabase (Auth + Database)
- PostgreSQL
- UUID para IDs

### Estructura de Carpetas

```
NutriAI/
├── frontend/                    # Aplicación React
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthForms.jsx    # Login/Register
│   │   │   ├── ChatWindow.jsx   # Chat principal
│   │   │   ├── ConversationSidebar.jsx  # Listado conversaciones
│   │   │   └── DashboardLayout.jsx      # Layout principal
│   │   ├── App.jsx              # Router principal
│   │   └── main.jsx
│   └── package.json
├── src/                         # Backend NestJS
│   ├── ai/
│   │   └── ai.service.ts        # Integración Gemini
│   ├── auth/
│   │   └── auth.controller.ts   # Autenticación
│   ├── conversations/
│   │   └── conversations.controller.ts # Chat API
│   ├── meal-plans/
│   │   ├── meal-plans.controller.ts
│   │   └── meal-plans.service.ts
│   ├── app.module.ts            # Configuración DI
│   └── main.ts                  # Entry point
├── test/
│   └── app.e2e-spec.ts
├── supabase_schema.sql          # Esquema BD
└── package.json
```

## 🚀 Instalación & Setup

### Requisitos Previos
- Node.js 16+ (v24 recomendado)
- npm o yarn
- Cuenta Supabase
- API Key de Gemini

### 1. Clonar Repositorio
```bash
git clone <repo-url>
cd NutriAI
```

### 2. Instalar Dependencias

**Backend:**
```bash
npm install
```

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

### 3. Configurar Supabase

#### a) Crear Proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Copia `Project URL` y `Service Role Key`

#### b) Ejecutar Migraciones SQL
En la consola SQL de Supabase, ejecuta:

```sql
-- Ejecutar primero el archivo supabase_schema.sql completo
-- Luego agregar campos nuevos:

ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS title TEXT;

ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_conversations_updated_at 
ON public.conversations(updated_at DESC);
```

#### c) Configurar Variables de Entorno
Actualiza las credenciales en los siguientes archivos:

**`src/app.module.ts`** (Backend):
```typescript
const supabaseUrl = 'https://vbobpybekjauvtrllmep.supabase.co'; // Tu URL
const supabaseServiceKey = 'your-service-key'; // Tu Service Key
```

**Frontend** (ya están configuradas en componentes):
- Los datos de Supabase se conectan automáticamente

### 4. Configurar Gemini API

En `src/ai/ai.service.ts`:
```typescript
private readonly apiKey = 'AIzaSyDDaqJhagrbOb33Y4K4CN0I81rUCLU-m3E'; // Tu API Key
private readonly modelName = 'gemini-2.5-flash'; // Modelo
```

### 5. Iniciar Aplicación

**Terminal 1 - Backend:**
```bash
npm run start:dev
```
Puerto: `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Puerto: `http://localhost:5173`

## 📚 API Endpoints

### Autenticación
- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Iniciar sesión
- `POST /auth/refresh` - Refrescar token

### Conversaciones
- `GET /conversations` - Listar conversaciones del usuario
- `POST /conversations` - Crear nueva conversación
- `GET /conversations/:id` - Obtener detalles de conversación
- `PATCH /conversations/:id` - Actualizar conversación (título, estado)
- `GET /conversations/:id/messages` - Obtener mensajes
- `POST /conversations/:id/messages` - Enviar mensaje (Dispara IA automáticamente)

### Planes de Comidas
- `GET /meal-plans` - Listar planes
- `POST /meal-plans` - Crear plan
- `GET /meal-plans/:id` - Obtener plan
- `PUT /meal-plans/:id` - Actualizar plan
- `DELETE /meal-plans/:id` - Eliminar plan

## 🔄 Flujo de Funcionamiento

### Nuevo Usuario
1. Accede a la aplicación
2. Ve pantalla de Login/Registro
3. Puede hacer Skip para modo Demo

### Enviando Mensaje
1. Usuario escribe en el input de chat
2. Presiona Enter o click en botón enviar
3. Mensaje se guarda en BD instantáneamente
4. Backend dispara AI Service automáticamente
5. IA genera respuesta usando Gemini
6. Respuesta se guarda en BD
7. Frontend refesca automáticamente cada 5 segundos
8. Conversación aparece en sidebar izquierdo

### Historial
1. Todas las conversaciones se muestran en sidebar
2. Ordenadas por más reciente primero
3. Preview del último mensaje visible
4. Click para abrir conversación completa
5. Historial persiste entre sesiones

## 🔑 Variables de Entorno

### Backend (src/app.module.ts)
```
SUPABASE_URL=https://vbobpybekjauvtrllmep.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
```

### AI Service (src/ai/ai.service.ts)
```
GEMINI_API_KEY=AIzaSyDDaqJhagrbOb33Y4K4CN0I81rUCLU-m3E
GEMINI_MODEL=gemini-2.5-flash
```

## 📝 Modelos de Base de Datos

### Users
```
id: UUID (Primary Key)
email: TEXT (Unique)
role: TEXT (admin, nutritionist, patient)
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### Conversations
```
id: UUID (Primary Key)
patient_id: UUID (FK -> users)
title: TEXT (Auto-generado del primer mensaje)
started_at: TIMESTAMP
updated_at: TIMESTAMP (Auto-actualizado)
status: TEXT (active, archived)
```

### Messages
```
id: UUID (Primary Key)
conversation_id: UUID (FK -> conversations)
sender_id: UUID (FK -> users)
content: TEXT
metadata: JSONB (role: user|assistant)
created_at: TIMESTAMP
```

## 🎨 Componentes React Principales

### App.jsx
- Router principal
- Manejo de rutas (login, register, dashboard)
- Manejo de sesión de usuario

### DashboardLayout.jsx
- Layout principal del dashboard
- Sidebar izquierdo (conversaciones)
- Sidebar derecho (perfil/resumen)
- Área de chat central

### ChatWindow.jsx
- Área de mensajes
- Input de usuario
- Integración con React Query
- Llamadas a API de mensajes

### ConversationSidebar.jsx
- Listado de conversaciones
- Búsqueda (estructura preparada)
- Indicador de conversación activa
- Información de última actualización

### AuthForms.jsx
- Formulario de login
- Formulario de registro
- Validación de campos
- Integración con Supabase Auth

## 🧪 Testing

### Backend Tests
```bash
npm run test
npm run test:cov
npm run test:e2e
```

### Frontend (Preparado para testing)
Se puede agregar React Testing Library

## 📦 Build & Deploy

### Build Backend
```bash
npm run build
```
Output: `dist/`

### Build Frontend
```bash
cd frontend
npm run build
```
Output: `dist/`

### Ejecutar Producción
```bash
npm run start:prod
```

## 🐛 Troubleshooting

### Error: "No users found in database"
**Solución:** Registra un usuario primero en la app de login

### Error: "Gemini API Error"
**Solución:** Verifica tu API Key y que tienes quota disponible

### Error: "Could not find table"
**Solución:** Asegúrate de ejecutar el SQL de migraciones en Supabase

### Chat no muestra mensajes
**Solución:** Abre DevTools → Network tab → verifica que `/api/conversations/:id/messages` retorna datos

### Historial no se actualiza
**Solución:** Espera 5 segundos (intervalo de polling) o actualiza manualmente F5

## 🚀 Próximas Mejoras Sugeridas

- [ ] WebSocket para actualizaciones en tiempo real
- [ ] Carga de imágenes de alimentos para análisis
- [ ] Exportación de planes de comida a PDF
- [ ] Integración con wearables (Fitbit, Apple Watch)
- [ ] Recomendaciones basadas en compras (Instacart)
- [ ] Sistema de puntos y gamificación
- [ ] Integración con nutricionistas reales
- [ ] Análisis de etiquetas nutricionales con OCR

## 📞 Soporte

Para reportar bugs o sugerencias, crea un issue en el repositorio.

## 📄 Licencia

UNLICENSED - Proyecto privado

---

**Creado con ❤️ por Antigravity**
**Powered by NestJS + React + Gemini AI**
