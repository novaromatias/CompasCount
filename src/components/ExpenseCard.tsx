import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { Expense, Participant } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface ExpenseCardProps {
  expense: Expense;
  participants: Participant[];
  onPress?: (expense: Expense) => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, participants, onPress }) => {
  const getParticipantName = (id: string) => {
    const p = participants.find((part) => part.id === id);
    return p ? p.name : 'Alguien';
  };

  // Resumen de quién pagó
  const payersSummary =
    expense.payers.length === 1
      ? `Pagó ${getParticipantName(expense.payers[0].participantId)}`
      : `Pagaron ${expense.payers.length} personas`;

  // Resumen de para quiénes (participantes del concepto)
  const splitsSummary =
    expense.splitType === 'EQUAL'
      ? `${expense.splits.length} amigos incluidos`
      : `${expense.splits.length} asignaciones exactas`;

  // Formato de fecha
  const formattedDate = new Date(expense.expenseDate).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
  });

  const content = (
    <>
      <View style={styles.iconContainer}>
        <Ionicons name="receipt-outline" size={22} color={colors.primarySoft} />
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {expense.title}
          </Text>
          <Ionicons name="pencil-sharp" size={12} color={colors.primarySoft} style={{ marginLeft: 6 }} />
        </View>
        <Text style={styles.payers}>{payersSummary} • {splitsSummary}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>

      <View style={styles.amountContainer}>
        <Text style={styles.currency}>$</Text>
        <Text style={styles.amount}>
          {expense.totalAmount.toLocaleString('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
        <View style={styles.splitBadge}>
          <Text style={styles.splitBadgeText}>
            {expense.splitType === 'EQUAL' ? 'Equitativo' : 'Exacto'}
          </Text>
        </View>
      </View>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => onPress(expense)}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.card}>{content}</View>;
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  payers: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 1,
  },
  date: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  currency: {
    color: colors.primarySoft,
    fontSize: 12,
    fontWeight: '700',
  },
  amount: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '800',
  },
  splitBadge: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: colors.backgroundSecondary,
  },
  splitBadgeText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
});
