# Plan de Implementación: Invitaciones, Notificaciones Push y Deep Linking

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar en Tricount App la creación de grupos con invitaciones por email (verificación de usuario registrado vs externo), despacho de notificaciones push simuladas y correo con Resend/Supabase en background, bandeja de invitaciones pendientes para aceptar/rechazar, y enlace compartible con reclamación de identidad de participantes sin login o con login de Google.

**Architecture:** Extensión del modelo de datos de participantes y grupos, creación de `invitationService` y `notificationService` locales simulando la capa de backend de Supabase/Edge Functions, integración en `NewGroupScreen`, `GroupsListScreen`, `GroupDetailScreen` y nuevo `JoinGroupModal`.

**Tech Stack:** React Native (Expo), TypeScript, AsyncStorage / Local State Mocking Supabase, Feather icons.

**Spec:** `docs/superpowers/specs/2026-10-19-group-invitations-design.md`

## Global Constraints
- Mantener la compatibilidad con el algoritmo de deudas y modelos existentes.
- Toda la lógica de red y supabase se simula de manera local y reactiva con AsyncStorage para que funcione inmediatamente en web y móviles.
- Proveer componentes accesibles y con estética cuidada (dark/light themes).

---

### Task 1: Ampliación de Tipos y Modelo de Datos
**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1:** Agregar las interfaces `GroupInvitation`, `AppPushNotification` y actualizar `Participant` con campos `email`, `userId`, `claimedAt`.
- [ ] **Step 2:** Verificar la compilación de TypeScript para asegurar que no rompa tipos existentes.

---

### Task 2: Servicios de Invitaciones y Notificaciones (`invitationService` & `notificationService`)
**Files:**
- Create: `src/services/notificationService.ts`
- Create: `src/services/invitationService.ts`

- [ ] **Step 1:** Implementar `notificationService` con soporte para almacenar y disparar notificaciones locales/push simuladas, además de logging y visualización de emails de invitación externa.
- [ ] **Step 2:** Implementar `invitationService` con métodos para verificar si un email existe, crear invitaciones, obtener pendientes por usuario y aceptar/rechazar invitaciones.

---

### Task 3: Actualizar `NewGroupScreen` con Detección de Email e Invitación
**Files:**
- Modify: `src/screens/NewGroupScreen.tsx`

- [ ] **Step 1:** Permitir ingresar participantes con formato Nombre o Email.
- [ ] **Step 2:** Validar en tiempo real si el email está registrado (🟢 Registrado) o no (✉️ Invitación por correo externo).
- [ ] **Step 3:** Al crear el grupo, generar las invitaciones correspondientes y disparar las notificaciones push / correos.

---

### Task 4: Bandeja de Invitaciones Pendientes en `GroupsListScreen`
**Files:**
- Create: `src/components/InvitationsModal.tsx`
- Modify: `src/screens/GroupsListScreen.tsx`

- [ ] **Step 1:** Crear el componente modal `InvitationsModal` para listar las invitaciones pendientes del usuario actual con opciones de Aceptar o Rechazar.
- [ ] **Step 2:** Agregar el botón de campana / badge de invitaciones en el header de `GroupsListScreen`.
- [ ] **Step 3:** Integrar la aceptación de invitaciones para que el grupo se incorpore a la lista y se asigne el participante al usuario.

---

### Task 5: Deep Link de Invitación & Modal de Reclamación de Identidad
**Files:**
- Create: `src/components/JoinGroupModal.tsx`
- Modify: `src/screens/GroupDetailScreen.tsx`
- Modify: `App.tsx` (o navegación principal para detectar link de invitación)

- [ ] **Step 1:** Agregar en `GroupDetailScreen` el botón "Copiar enlace de invitación" que copia el link al portapapeles con confirmación visual.
- [ ] **Step 2:** Crear `JoinGroupModal` que liste los participantes sin cuenta asignada (`userId == null`), permita seleccionar quién es y vincular su sesión (Google o invitado local).
- [ ] **Step 3:** Implementar la advertencia en caso de que todos los participantes ya tengan cuenta vinculada.
- [ ] **Step 4:** Agregar en el header una opción de simulación para probar "Abrir link de invitación de este grupo" fácilmente.
