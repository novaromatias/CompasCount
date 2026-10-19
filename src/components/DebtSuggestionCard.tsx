import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { DebtSuggestion } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from './Avatar';

interface DebtSuggestionCardProps {
  suggestion: DebtSuggestion;
  onPayPress: (suggestion: DebtSuggestion) => void;
}

export const DebtSuggestionCard: React.FC<DebtSuggestionCardProps> = ({
  suggestion,
  onPayPress,
}) => {
  return (
    <View style={styles.card}>
      {/* Transfer visual diagram */}
      <View style={styles.transferFlow}>
        {/* Debtor */}
        <View style={styles.partyBox}>
          <Avatar name={suggestion.fromName} size="md" />
          <Text style={styles.partyName} numberOfLines={1}>
            {suggestion.fromName}
          </Text>
          <View style={[styles.roleTag, { backgroundColor: colors.debtorSoft }]}>
            <Text style={[styles.roleTagText, { color: colors.debtor }]}>Paga</Text>
          </View>
        </View>

        {/* Amount & Arrow */}
        <View style={styles.centerArrowCol}>
          <View style={styles.amountPill}>
            <Text style={styles.currencySymbol}>$</Text>
            <Text style={styles.amountText}>
              {suggestion.amount.toLocaleString('es-AR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>

          <View style={styles.arrowLineWrap}>
            <View style={styles.dashLine} />
            <Ionicons name="arrow-forward" size={16} color={colors.primarySoft} />
            <View style={styles.dashLine} />
          </View>
        </View>

        {/* Creditor */}
        <View style={styles.partyBox}>
          <Avatar name={suggestion.toName} size="md" />
          <Text style={styles.partyName} numberOfLines={1}>
            {suggestion.toName}
          </Text>
          <View style={[styles.roleTag, { backgroundColor: colors.creditorSoft }]}>
            <Text style={[styles.roleTagText, { color: colors.creditor }]}>Recibe</Text>
          </View>
        </View>
      </View>

      {/* Footer with action */}
      <View style={styles.footerRow}>
        <View style={styles.hintWrap}>
          <Ionicons name="flash-outline" size={13} color={colors.primarySoft} />
          <Text style={styles.hintText}>Transferencia simplificada</Text>
        </View>

        <TouchableOpacity
          style={styles.payButton}
          onPress={() => onPayPress(suggestion)}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle-outline" size={16} color={colors.white} style={{ marginRight: 6 }} />
          <Text style={styles.payButtonText}>Registrar Pago</Text>
        </TouchableOpacity>
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
  transferFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  partyBox: {
    alignItems: 'center',
    width: 90,
  },
  partyName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
  },
  roleTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  centerArrowCol: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  amountPill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorderGlow,
    marginBottom: 6,
  },
  currencySymbol: {
    color: colors.primarySoft,
    fontSize: 14,
    fontWeight: '700',
    marginRight: 2,
  },
  amountText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  arrowLineWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    gap: 4,
  },
  dashLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.cardBorder,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 12,
    marginTop: 10,
  },
  hintWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  hintText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  payButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  payButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
});
