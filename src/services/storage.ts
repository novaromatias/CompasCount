import AsyncStorage from '@react-native-async-storage/async-storage';
import { TricountGroup, Expense, Payment, Participant } from '../types';

const STORAGE_KEYS = {
  GROUPS: '@tricount_groups',
  CURRENT_USER: '@tricount_user',
  OFFLINE_QUEUE: '@tricount_offline_queue',
};

// Datos iniciales de demostración para probar de inmediato la app
const INITIAL_MOCK_GROUPS: TricountGroup[] = [
  {
    id: 'group-demo-1',
    title: 'Viaje a Bariloche 🏔️',
    description: 'Vacaciones de invierno con amigos',
    currencySymbol: '$',
    shareCode: 'BARI2026',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    participants: [
      { id: 'part-1', groupId: 'group-demo-1', name: 'Yo (Matias)', createdAt: new Date().toISOString() },
      { id: 'part-2', groupId: 'group-demo-1', name: 'Juan', createdAt: new Date().toISOString() },
      { id: 'part-3', groupId: 'group-demo-1', name: 'Pedro', createdAt: new Date().toISOString() },
      { id: 'part-4', groupId: 'group-demo-1', name: 'Sofia', createdAt: new Date().toISOString() },
    ],
    expenses: [
      {
        id: 'exp-1',
        groupId: 'group-demo-1',
        title: 'Cabaña primera noche',
        totalAmount: 120000,
        splitType: 'EQUAL',
        expenseDate: new Date(Date.now() - 86400000 * 4).toISOString(),
        payers: [{ participantId: 'part-1', amount: 120000 }],
        splits: [
          { participantId: 'part-1', amount: 30000 },
          { participantId: 'part-2', amount: 30000 },
          { participantId: 'part-3', amount: 30000 },
          { participantId: 'part-4', amount: 30000 },
        ],
        createdOfflineAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
      {
        id: 'exp-2',
        groupId: 'group-demo-1',
        title: 'Asado y bebidas',
        totalAmount: 48000,
        splitType: 'EQUAL',
        expenseDate: new Date(Date.now() - 86400000 * 3).toISOString(),
        payers: [
          { participantId: 'part-2', amount: 28000 },
          { participantId: 'part-3', amount: 20000 },
        ],
        splits: [
          { participantId: 'part-1', amount: 12000 },
          { participantId: 'part-2', amount: 12000 },
          { participantId: 'part-3', amount: 12000 },
          { participantId: 'part-4', amount: 12000 },
        ],
        createdOfflineAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
    ],
    payments: [
      {
        id: 'pay-1',
        groupId: 'group-demo-1',
        fromParticipantId: 'part-4',
        toParticipantId: 'part-1',
        amount: 30000,
        paymentDate: new Date(Date.now() - 86400000 * 2).toISOString(),
        note: 'Pago inicial cabaña',
        createdOfflineAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ],
  },
];

export async function getStoredGroups(): Promise<TricountGroup[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.GROUPS);
    if (!raw) {
      // Guardar grupos iniciales para primera experiencia
      await AsyncStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(INITIAL_MOCK_GROUPS));
      return INITIAL_MOCK_GROUPS;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error al leer grupos:', error);
    return INITIAL_MOCK_GROUPS;
  }
}

export async function saveGroups(groups: TricountGroup[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
}

export async function getGroupById(groupId: string): Promise<TricountGroup | null> {
  const groups = await getStoredGroups();
  return groups.find((g) => g.id === groupId) || null;
}

export async function createGroup(
  title: string,
  description: string,
  participantItems: Array<string | { name: string; email?: string; userId?: string }>
): Promise<TricountGroup> {
  const groups = await getStoredGroups();
  const groupId = `grp-${Date.now()}`;
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  const participants: Participant[] = participantItems
    .map((item, index) => {
      const name = typeof item === 'string' ? item.trim() : item.name.trim();
      const email = typeof item === 'object' ? item.email : undefined;
      const userId = typeof item === 'object' ? item.userId : undefined;
      return {
        id: `part-${groupId}-${index + 1}`,
        groupId,
        name,
        email,
        userId,
        createdAt: new Date().toISOString(),
      };
    })
    .filter((p) => p.name.length > 0);

  const newGroup: TricountGroup = {
    id: groupId,
    title,
    description,
    currencySymbol: '$',
    shareCode: code,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    participants,
    expenses: [],
    payments: [],
  };

  groups.unshift(newGroup);
  await saveGroups(groups);
  return newGroup;
}

export async function addExpenseToGroup(
  groupId: string,
  expenseData: Omit<Expense, 'id' | 'groupId' | 'createdOfflineAt' | 'updatedAt'>
): Promise<Expense> {
  const groups = await getStoredGroups();
  const groupIndex = groups.findIndex((g) => g.id === groupId);
  if (groupIndex === -1) throw new Error('Grupo no encontrado');

  const now = new Date().toISOString();
  const newExpense: Expense = {
    ...expenseData,
    id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    groupId,
    createdOfflineAt: now,
    updatedAt: now,
  };

  groups[groupIndex].expenses.unshift(newExpense);
  groups[groupIndex].updatedAt = now;
  await saveGroups(groups);
  return newExpense;
}

export async function updateExpenseInGroup(
  groupId: string,
  expenseId: string,
  updatedData: Omit<Expense, 'id' | 'groupId' | 'createdOfflineAt' | 'updatedAt'>
): Promise<Expense> {
  const groups = await getStoredGroups();
  const groupIndex = groups.findIndex((g) => g.id === groupId);
  if (groupIndex === -1) throw new Error('Grupo no encontrado');

  const expIndex = groups[groupIndex].expenses.findIndex((e) => e.id === expenseId);
  if (expIndex === -1) throw new Error('Gasto no encontrado');

  const oldExp = groups[groupIndex].expenses[expIndex];
  const now = new Date().toISOString();

  const updatedExpense: Expense = {
    ...oldExp,
    ...updatedData,
    updatedAt: now,
  };

  groups[groupIndex].expenses[expIndex] = updatedExpense;
  groups[groupIndex].updatedAt = now;
  await saveGroups(groups);
  return updatedExpense;
}

export async function deleteExpenseFromGroup(
  groupId: string,
  expenseId: string
): Promise<void> {
  const groups = await getStoredGroups();
  const groupIndex = groups.findIndex((g) => g.id === groupId);
  if (groupIndex === -1) throw new Error('Grupo no encontrado');

  groups[groupIndex].expenses = groups[groupIndex].expenses.filter((e) => e.id !== expenseId);
  groups[groupIndex].updatedAt = new Date().toISOString();
  await saveGroups(groups);
}

export async function addPaymentToGroup(
  groupId: string,
  paymentData: Omit<Payment, 'id' | 'groupId' | 'createdOfflineAt' | 'updatedAt'>
): Promise<Payment> {
  const groups = await getStoredGroups();
  const groupIndex = groups.findIndex((g) => g.id === groupId);
  if (groupIndex === -1) throw new Error('Grupo no encontrado');

  const now = new Date().toISOString();
  const newPayment: Payment = {
    ...paymentData,
    id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    groupId,
    createdOfflineAt: now,
    updatedAt: now,
  };

  groups[groupIndex].payments.unshift(newPayment);
  groups[groupIndex].updatedAt = now;
  await saveGroups(groups);
  return newPayment;
}
