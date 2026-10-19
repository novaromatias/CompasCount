export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  isGuest: boolean;
  avatarUrl?: string;
}

export interface Participant {
  id: string;
  groupId: string;
  name: string;
  email?: string;
  userId?: string;
  claimedAt?: string;
  createdAt: string;
}

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

export interface ExpensePayer {
  participantId: string;
  amount: number;
}

export interface ExpenseSplit {
  participantId: string;
  amount: number;
  percentage?: number;
}

export type SplitType = 'EQUAL' | 'EXACT';

export interface Expense {
  id: string;
  groupId: string;
  title: string;
  totalAmount: number;
  splitType: SplitType;
  expenseDate: string;
  payers: ExpensePayer[];
  splits: ExpenseSplit[];
  createdOfflineAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  groupId: string;
  fromParticipantId: string;
  toParticipantId: string;
  amount: number;
  paymentDate: string;
  note?: string;
  createdOfflineAt: string;
  updatedAt: string;
}

export interface TricountGroup {
  id: string;
  title: string;
  description?: string;
  currencySymbol: string;
  shareCode: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  participants: Participant[];
  expenses: Expense[];
  payments: Payment[];
}

export interface ParticipantBalance {
  participantId: string;
  name: string;
  totalPaid: number;
  totalSpent: number;
  totalSentPayments: number;
  totalReceivedPayments: number;
  netBalance: number;
}

export interface DebtSuggestion {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amount: number;
}
