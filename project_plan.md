# NutriAI Project Plan

## Epics
1.  **Autenticación y perfiles**: Secure login, profile management.
2.  **Chat IA + Historial**: Core assistant functionality.
3.  **Planes Alimenticios (CRUD)**: Meal planning module.
4.  **Panel Nutricionistas**: Management view for professionals.
5.  **Seguridad & Infra**: RLS, Deploy, CI/CD.

## User Stories (Backlog)

### US-01: Patient Registration
**As a** Patient,
**I want** to register and create my profile,
**So that** I can receive personalized recommendations.
*   **AC1**: Register with Email, Password, Name.
*   **AC2**: Verify email (Supabase).
*   **AC3**: Fill mandatory profile fields (Height, Weight, Age).

### US-02: AI Conversation
**As a** Patient,
**I want** to start a conversation with the AI and see my history,
**So that** I can get instant advice.
*   **AC1**: Create new conversation button.
*   **AC2**: Persistence of messages.
*   **AC3**: Optimistic UI for fast feel.

### US-03: Nutritionist Dashboard
**As a** Nutritionist,
**I want** to view my assigned patients' conversations,
**So that** I can monitor their progress.
*   **AC1**: List only assigned patients.
*   **AC2**: Read-only view of chat history.

## Sprint 1 Plan (2 Weeks)

### Goals
- Fully functional Authentication (End-to-end).
- Database Schema deployed with Basic RLS.
- Chat UI skeleton (Frontend connected to Mock/basic API).

### Tasks
1.  **Infra**: Setup Supabase project & Repo.
2.  **Backend**: Implement Auth Endpoints & Middleware.
3.  **Frontend**: Build Login/Register Pages.
4.  **Frontend**: Build Dashboard Layout.
5.  **Database**: Migrate Schema (Users, Profiles).

### Definition of Done (DoD)
- [ ] Code merged to `main` with PR approval.
- [ ] Unit tests passing (>70% coverage for new logic).
- [ ] Deployed to Dev Environment.
- [ ] Responsive UI verified on Mobile/Desktop.
