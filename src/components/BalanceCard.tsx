import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { ParticipantBalance } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface BalanceCardProps {
  balance: ParticipantBalance;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ balance }) => {
  const isCreditor = balance.netBalance > 0.009;
  const isDebtor = balance.netBalance < -0.009;

  const statusColor = isCreditor
    ? colors.creditor
    : isDebtor
    ? colors.debtor
    : colors.settled;

  const statusText = isCreditor
    ? 'Le deben'
    : isDebtor
    ? 'Debe'
    : 'Al día';

  const iconName = isCreditor
    ? 'arrow-up-circle'
    : isDebtor
    ? 'arrow-down-circle'
    : 'checkmark-circle';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.nameRow}>
          <Ionicons name="person" size={18} color={colors.primarySoft} />
          <Text style={styles.name}>{balance.name}</Text>
        </View>

        <View style={[styles.badge, { backgroundColor: `${statusColor}20`, borderColor: statusColor }]}>
          <Ionicons name={iconName} size={14} color={statusColor} style={{ marginRight: 4 }} />
          <Text style={[styles.badgeText, { color: statusColor }]}>{statusText}</Text>
        </View>
      </View>

      <View style={styles.netAmountRow}>
        <Text style={styles.currency}>$</Text>
        <Text style={[styles.netAmount, { color: statusColor }]}>
          {Math.abs(balance.netBalance).toLocaleString('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </View>

      <View style={styles.breakdownRow}>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Pagó en total</Text>
          <Text style={styles.breakdownValue}>
            ${balance.totalPaid.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Consumió</Text>
          <Text style={styles.breakdownValue}>
            ${balance.totalSpent.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  netAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 4,
  },
  currency: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textSecondary,
    marginRight: 4,
  },
  netAmount: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: colors.cardBorder,
  },
  breakdownLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginBottom: 2,
  },
  breakdownValue: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
});
