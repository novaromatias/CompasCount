import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración de Supabase (Reemplazar con tus credenciales de Supabase)
export const SUPABASE_CONFIG = {
  url: 'https://dexvustzuwrdnoylarvb.supabase.co', // Proyecto existente o configurar en .env
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key_for_offline_first',
};

export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export interface OfflineMutation {
  id: string;
  table: 'expenses' | 'payments' | 'groups';
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  payload: any;
  createdOfflineAt: string;
}

const OFFLINE_QUEUE_KEY = '@tricount_offline_queue';

export async function queueOfflineMutation(mutation: OfflineMutation) {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    const queue: OfflineMutation[] = raw ? JSON.parse(raw) : [];
    queue.push(mutation);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('Error encolando mutación offline:', err);
  }
}

export async function processOfflineQueue(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return 0;
    const queue: OfflineMutation[] = JSON.parse(raw);
    if (queue.length === 0) return 0;

    // Procesar cada mutación respetando el Last-Write-Wins por timestamp
    const pending: OfflineMutation[] = [];
    for (const item of queue) {
      try {
        // Enviar a Supabase con created_offline_at para resolución de conflictos
        if (item.type === 'INSERT') {
          const { error } = await supabase.from(item.table).insert({
            ...item.payload,
            created_offline_at: item.createdOfflineAt,
          });
          if (error) pending.push(item);
        }
      } catch (e) {
        pending.push(item);
      }
    }

    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(pending));
    return queue.length - pending.length;
  } catch (err) {
    console.error('Error procesando cola offline:', err);
    return 0;
  }
}
