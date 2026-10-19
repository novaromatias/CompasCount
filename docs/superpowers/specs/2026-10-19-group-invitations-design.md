# Diseño: Invitaciones, Notificaciones Push y Deep Linking en Grupos

**Fecha:** 2026-10-19  
**Estado:** Aprobado  
**Alcance:** Frontend Expo/React Native (Tricount App) con simulación local persistente preparada para backend Supabase / Resend.

---

## 1. Objetivos y Resumen del Flujo
1. **Creación de Grupo con Invitaciones por Correo:**
   - Permitir al creador ingresar participantes por nombre y/o correo electrónico.
   - Si el correo existe en la app (registrado), se marca para notificación push e invitación en su bandeja interna de la app.
   - Si el correo NO existe en la app, se genera una invitación pendiente y se simula el despacho de correo transaccional (Edge Function + Resend) con link de invitación directa.
2. **Bandeja de Invitaciones Pendientes (Inbox):**
   - Acceso visible en la pantalla principal de grupos (`GroupsList`) con badge de conteo pendiente.
   - Permite al usuario revisar quién lo invitó, a qué grupo y Aceptar o Rechazar la invitación.
3. **Link de Invitación Compartible & Reclamación de Identidad ("Claim"):**
   - Botón para copiar enlace en el detalle del grupo.
   - Al acceder mediante el enlace (vía deep link o query param `?joinGroup=GROUP_ID`):
     - Muestra los participantes disponibles que no tienen usuario asignado (`userId == null`).
     - Si el usuario tiene sesión iniciada con Google, al tocar su nombre se asocia permanentemente su `userId` y `email` a ese participante.
     - Si todos los participantes del grupo ya tienen usuario asignado, muestra advertencia de bloqueo indicando que no hay lugares libres.
4. **Autenticación con Google (Simulación completa / Supabase Auth Ready):**
   - Perfil de usuario activo con cambio rápido o login/logout de Google para probar escenarios multi-usuario en desarrollo.

---

## 2. Modelo de Datos y Tipos

```typescript
// Entidad Invitación
export interface GroupInvitation {
  id: string;
  groupId: string;
  groupTitle: string;
  inviterName: string;
  inviterEmail: string;
  inviteeEmail: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  isRegisteredUser: boolean;
}

// Ampliación de Participant
export interface Participant {
  id: string;
  groupId: string;
  name: string;
  email?: string;
  userId?: string; // ID de usuario registrado vinculado
  claimedAt?: string;
  createdAt: string;
}

// Notificación Local / Push
export interface AppPushNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'GROUP_INVITE' | 'EXPENSE_ADDED' | 'SYSTEM';
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}
```

---

## 3. Servicios y Almacenamiento Local (Mocking Supabase)
- `invitationService.ts`:
  - `checkUserExistsByEmail(email: string): Promise<boolean>`
  - `createInvitations(groupId: string, groupTitle: string, emails: string[]): Promise<GroupInvitation[]>`
  - `getPendingInvitations(userEmail: string): Promise<GroupInvitation[]>`
  - `respondToInvitation(invitationId: string, accept: boolean): Promise<void>`
  - `claimParticipantIdentity(groupId: string, participantId: string, user: UserProfile): Promise<void>`
- `notificationService.ts`:
  - `sendPushNotification(toUserId: string, title: string, body: string, data?: any): Promise<void>`
  - `getNotifications(userId: string): Promise<AppPushNotification[]>`
  - `simulateEmailDispatch(toEmail: string, groupTitle: string, joinLink: string): Promise<void>`

---

## 4. Componentes y Pantallas Afectadas
1. `NewGroupScreen.tsx`:
   - Input de participante con selector "Nombre / Email".
   - Verificación instantánea con badge visual (🟢 Registrado / ✉️ Invitación externa por email).
   - Creación y despacho automático de invitaciones.
2. `GroupsListScreen.tsx`:
   - Header con botón de campana / badge de invitaciones pendientes.
   - Banner de notificación interactivo cuando entra una invitación en tiempo real.
3. `InvitationsModal.tsx` o `InvitationsScreen.tsx`:
   - Lista de invitaciones con botones de Aceptar / Rechazar.
4. `GroupDetailScreen.tsx`:
   - Botón "Copiar link de invitación" con feedback visual (toast / copiado al portapapeles).
   - Indicador en lista de participantes: si tiene cuenta asignada o si es participante invitado.
5. `JoinGroupModal.tsx`:
   - Flujo que se dispara al abrir un link de invitación.
   - Lista de participantes libres para reclamar identidad.
   - Alerta si todos tienen cuenta vinculada.
