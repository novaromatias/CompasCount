import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { Expense, Participant } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from './Avatar';
import { getExpenseCategoryMeta } from '../utils/categoryIcons';

interface ExpenseCardProps {
  expense: Expense;
  participants: Participant[];
  onPress?: (expense: Expense) => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, participants, onPress }) => {
  const getParticipant = (id: string) => participants.find((part) => part.id === id);

  const mainPayer = expense.payers.length > 0 ? getParticipant(expense.payers[0].participantId) : null;
  const isMultiPayer = expense.payers.length > 1;

  const payerLabel = isMultiPayer
    ? `${expense.payers.length} personas pagaron`
    : `Pagó ${mainPayer?.name || 'Alguien'}`;

  const splitsLabel =
    expense.splitType === 'EQUAL'
      ? `${expense.splits.length} amigos`
      : `${expense.splits.length} asignaciones`;

  const formattedDate = new Date(expense.expenseDate).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
  });

  const categoryMeta = getExpenseCategoryMeta(expense.title);

  const formattedAmount = expense.totalAmount.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const content = (
    <View style={styles.cardInner}>
      {/* Category Icon Badge */}
      <View style={[styles.categoryIconWrap, { backgroundColor: categoryMeta.bg }]}>
        <Ionicons name={categoryMeta.icon as any} size={20} color={categoryMeta.color} />
      </View>

      {/* Main Info */}
      <View style={styles.infoCol}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {expense.title}
          </Text>
        </View>

        <View style={styles.metaRow}>
          {mainPayer && !isMultiPayer ? (
            <View style={styles.payerChip}>
              <Avatar name={mainPayer.name} size="sm" />
              <Text style={styles.payerText} numberOfLines={1}>
                {mainPayer.name}
              </Text>
            </View>
          ) : (
            <View style={styles.payerChip}>
              <Ionicons name="people" size={12} color={colors.primarySoft} />
              <Text style={styles.payerText}>{payerLabel}</Text>
            </View>
          )}

          <Text style={styles.dotSeparator}>•</Text>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>

        {/* Split info tag */}
        <View style={styles.splitRow}>
          <View style={styles.splitBadge}>
            <Ionicons name="git-branch-outline" size={11} color={colors.textSecondary} />
            <Text style={styles.splitBadgeText}>{splitsLabel}</Text>
          </View>
        </View>
      </View>

      {/* Amount and Chevron */}
      <View style={styles.amountCol}>
        <View style={styles.amountWrap}>
          <Text style={styles.currencySymbol}>$</Text>
          <Text style={styles.amountValue}>{formattedAmount}</Text>
        </View>
        {onPress && (
          <View style={styles.editPill}>
            <Text style={styles.editPillText}>Editar</Text>
            <Ionicons name="chevron-forward" size={12} color={colors.textMuted} />
          </View>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => onPress(expense)}
        activeOpacity={0.75}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.card}>{content}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  payerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  payerText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  dotSeparator: {
    color: colors.textMuted,
    fontSize: 12,
  },
  dateText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  splitRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  splitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
    borderWidth: 0.5,
    borderColor: colors.cardBorder,
  },
  splitBadgeText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  amountCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  amountWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currencySymbol: {
    color: colors.primarySoft,
    fontSize: 13,
    fontWeight: '700',
    marginRight: 2,
  },
  amountValue: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  editPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  editPillText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
});
