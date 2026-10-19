import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppPushNotification } from '../types';

const NOTIFICATIONS_STORAGE_KEY = '@compascount_push_notifications';

// Usuarios de prueba pre-registrados en la app localmente para simulación
export const MOCK_REGISTERED_USERS = [
  { id: 'usr-matias', name: 'Matias Novaro', email: 'matias.novaro@gmail.com' },
  { id: 'usr-lucas', name: 'Lucas Rossi', email: 'lucas@gmail.com' },
  { id: 'usr-sofia', name: 'Sofia Alvarez', email: 'sofi@gmail.com' },
  { id: 'usr-juan', name: 'Juan Perez', email: 'juan@gmail.com' },
  { id: 'usr-pedro', name: 'Pedro Gomez', email: 'pedro@gmail.com' },
];

/**
 * Obtiene todas las notificaciones push locales almacenadas
 */
export async function getStoredNotifications(): Promise<AppPushNotification[]> {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error leyendo notificaciones:', error);
    return [];
  }
}

/**
 * Guarda las notificaciones en almacenamiento
 */
export async function saveNotifications(notifications: AppPushNotification[]): Promise<void> {
  await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
}

/**
 * Envía una notificación push simulada a un usuario registrado
 */
export async function sendPushNotification(
  toUserId: string,
  title: string,
  message: string,
  data?: Record<string, any>
): Promise<AppPushNotification> {
  const notifications = await getStoredNotifications();
  const newNotif: AppPushNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId: toUserId,
    title,
    message,
    type: data?.type || 'GROUP_INVITE',
    data,
    read: false,
    createdAt: new Date().toISOString(),
  };

  notifications.unshift(newNotif);
  await saveNotifications(notifications);
  console.log(`[PUSH SIMULATOR] Notificación push enviada a [${toUserId}]: "${title} - ${message}"`);
  return newNotif;
}

/**
 * Simula el despacho de un correo electrónico en segundo plano vía Supabase Edge Function / Resend
 */
export async function simulateEmailDispatch(
  toEmail: string,
  groupTitle: string,
  inviterName: string,
  joinLink: string
): Promise<{ success: boolean; previewHtml: string }> {
  console.log(`[EMAIL SERVICE] Despachando correo transaccional vía Resend/Supabase a: ${toEmail}`);
  console.log(`  De: ${inviterName} (vía CompasCount)`);
  console.log(`  Asunto: ¡Te invitaron al grupo "${groupTitle}" en CompasCount!`);
  console.log(`  Link de ingreso: ${joinLink}`);

  const previewHtml = `
    <div style="font-family: sans-serif; padding: 20px; background: #0A0D14; color: #FFFFFF;">
      <h2>¡Hola! ${inviterName} te ha invitado a "${groupTitle}"</h2>
      <p>Entra para ver las cuentas, agregar gastos y saldar deudas fácilmente.</p>
      <a href="${joinLink}" style="background: #3B82F6; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; display: inline-block;">
        Unirme al grupo
      </a>
    </div>
  `;

  return { success: true, previewHtml };
}
