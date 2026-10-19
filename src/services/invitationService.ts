import AsyncStorage from '@react-native-async-storage/async-storage';
import { GroupInvitation, UserProfile, TricountGroup } from '../types';
import { MOCK_REGISTERED_USERS, sendPushNotification, simulateEmailDispatch } from './notificationService';
import { getStoredGroups, saveGroups } from './storage';

const INVITATIONS_STORAGE_KEY = '@compascount_group_invitations';

/**
 * Obtiene todas las invitaciones guardadas
 */
export async function getStoredInvitations(): Promise<GroupInvitation[]> {
  try {
    const raw = await AsyncStorage.getItem(INVITATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error leyendo invitaciones:', error);
    return [];
  }
}

/**
 * Guarda las invitaciones
 */
export async function saveInvitations(invitations: GroupInvitation[]): Promise<void> {
  await AsyncStorage.setItem(INVITATIONS_STORAGE_KEY, JSON.stringify(invitations));
}

/**
 * Verifica si un email corresponde a un usuario registrado en la app
 */
export async function checkUserExistsByEmail(email: string): Promise<{ exists: boolean; user?: { id: string; name: string; email: string } }> {
  const cleanEmail = email.trim().toLowerCase();
  const found = MOCK_REGISTERED_USERS.find((u) => u.email.toLowerCase() === cleanEmail);
  return {
    exists: !!found,
    user: found,
  };
}

/**
 * Crea invitaciones para una lista de participantes con correo
 */
export async function createAndSendInvitations(
  group: TricountGroup,
  inviter: UserProfile,
  invitees: Array<{ name: string; email: string }>
): Promise<GroupInvitation[]> {
  const invitations = await getStoredInvitations();
  const newInvitations: GroupInvitation[] = [];

  const joinLink = `http://localhost:8081/?joinGroup=${group.id}`;

  for (const item of invitees) {
    const cleanEmail = item.email.trim().toLowerCase();
    const { exists, user: targetUser } = await checkUserExistsByEmail(cleanEmail);

    const invitation: GroupInvitation = {
      id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      groupId: group.id,
      groupTitle: group.title,
      inviterName: inviter.name || 'Un amigo',
      inviterEmail: inviter.email || 'invitaciones@compascount.app',
      inviteeEmail: cleanEmail,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      isRegisteredUser: exists,
    };

    invitations.unshift(invitation);
    newInvitations.push(invitation);

    if (exists && targetUser) {
      // Usuario registrado: enviar Notificación Push a su cuenta
      await sendPushNotification(
        targetUser.id,
        `¡Invitación a ${group.title}!`,
        `${inviter.name} te invitó a unirte al grupo. Toca para ver y aceptar.`,
        { type: 'GROUP_INVITE', groupId: group.id, invitationId: invitation.id }
      );
    } else {
      // Usuario no registrado: despachar correo en background vía Edge Function / Resend
      await simulateEmailDispatch(cleanEmail, group.title, inviter.name, joinLink);
    }
  }

  await saveInvitations(invitations);
  return newInvitations;
}

/**
 * Obtiene las invitaciones pendientes para un usuario dado su email
 */
export async function getPendingInvitationsForEmail(email?: string): Promise<GroupInvitation[]> {
  if (!email) return [];
  const cleanEmail = email.trim().toLowerCase();
  const all = await getStoredInvitations();
  return all.filter((inv) => inv.inviteeEmail.toLowerCase() === cleanEmail && inv.status === 'PENDING');
}

/**
 * Acepta o rechaza una invitación
 */
export async function respondToInvitation(
  invitationId: string,
  accept: boolean,
  currentUser: UserProfile
): Promise<void> {
  const invitations = await getStoredInvitations();
  const index = invitations.findIndex((i) => i.id === invitationId);
  if (index === -1) return;

  invitations[index].status = accept ? 'ACCEPTED' : 'REJECTED';
  await saveInvitations(invitations);

  if (accept) {
    // Si aceptó, vincular al usuario como participante del grupo
    const groups = await getStoredGroups();
    const groupIndex = groups.findIndex((g) => g.id === invitations[index].groupId);
    if (groupIndex !== -1) {
      const group = groups[groupIndex];
      // Buscar si ya existía un participante con ese email o nombre libre
      const freePartIndex = group.participants.findIndex(
        (p) => (!p.userId && p.email?.toLowerCase() === currentUser.email?.toLowerCase()) || (!p.userId && p.name.toLowerCase() === currentUser.name.toLowerCase())
      );

      if (freePartIndex !== -1) {
        group.participants[freePartIndex].userId = currentUser.id;
        group.participants[freePartIndex].email = currentUser.email;
        group.participants[freePartIndex].claimedAt = new Date().toISOString();
      } else {
        // Si no había slot previo, agregarlo como nuevo participante
        group.participants.push({
          id: `part-${group.id}-${group.participants.length + 1}`,
          groupId: group.id,
          name: currentUser.name,
          email: currentUser.email,
          userId: currentUser.id,
          claimedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        });
      }
      group.updatedAt = new Date().toISOString();
      await saveGroups(groups);
    }
  }
}

/**
 * Reclamar la identidad de un participante en un grupo
 */
export async function claimParticipant(
  groupId: string,
  participantId: string,
  user: UserProfile
): Promise<boolean> {
  const groups = await getStoredGroups();
  const groupIndex = groups.findIndex((g) => g.id === groupId);
  if (groupIndex === -1) return false;

  const group = groups[groupIndex];
  const partIndex = group.participants.findIndex((p) => p.id === participantId);
  if (partIndex === -1) return false;

  // Si ya tiene userId asignado a otra persona, no se puede reclamar
  if (group.participants[partIndex].userId && group.participants[partIndex].userId !== user.id) {
    return false;
  }

  group.participants[partIndex].userId = user.id;
  if (user.email) {
    group.participants[partIndex].email = user.email;
  }
  group.participants[partIndex].claimedAt = new Date().toISOString();
  group.updatedAt = new Date().toISOString();

  await saveGroups(groups);
  return true;
}
