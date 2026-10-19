import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { ParticipantBalance } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from './Avatar';

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

  const statusBg = isCreditor
    ? colors.creditorSoft
    : isDebtor
    ? colors.debtorSoft
    : colors.settledSoft;

  const statusText = isCreditor
    ? 'Le deben'
    : isDebtor
    ? 'Debe'
    : 'Al día';

  const iconName = isCreditor
    ? 'arrow-up'
    : isDebtor
    ? 'arrow-down'
    : 'checkmark';

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.personWrap}>
          <Avatar name={balance.name} size="md" />
          <View style={styles.nameBlock}>
            <Text style={styles.name} numberOfLines={1}>
              {balance.name}
            </Text>
            <Text style={styles.roleSub}>Participante</Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusBg, borderColor: `${statusColor}50` }]}>
          <Ionicons name={iconName} size={13} color={statusColor} style={{ marginRight: 4 }} />
          <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
        </View>
      </View>

      {/* Hero balance amount */}
      <View style={styles.balanceRow}>
        <Text style={styles.balanceLabel}>Balance neto:</Text>
        <View style={styles.amountWrap}>
          <Text style={[styles.currency, { color: statusColor }]}>$</Text>
          <Text style={[styles.netAmount, { color: statusColor }]}>
            {Math.abs(balance.netBalance).toLocaleString('es-AR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>
      </View>

      {/* Ledger breakdown */}
      <View style={styles.ledgerContainer}>
        <View style={styles.ledgerItem}>
          <View style={styles.ledgerIconLabel}>
            <Ionicons name="wallet-outline" size={13} color={colors.textSecondary} />
            <Text style={styles.ledgerLabel}>Pagó en total</Text>
          </View>
          <Text style={styles.ledgerValue}>
            ${balance.totalPaid.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>

        <View style={styles.verticalDivider} />

        <View style={styles.ledgerItem}>
          <View style={styles.ledgerIconLabel}>
            <Ionicons name="pie-chart-outline" size={13} color={colors.textSecondary} />
            <Text style={styles.ledgerLabel}>Consumió</Text>
          </View>
          <Text style={styles.ledgerValue}>
            ${balance.totalSpent.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  personWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  nameBlock: {
    flex: 1,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  roleSub: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  balanceLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  amountWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 2,
  },
  netAmount: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  ledgerContainer: {
    flexDirection: 'row',
    paddingTop: 6,
  },
  ledgerItem: {
    flex: 1,
  },
  ledgerIconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  ledgerLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  ledgerValue: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  verticalDivider: {
    width: 1,
    backgroundColor: colors.cardBorder,
    marginHorizontal: 12,
  },
});
