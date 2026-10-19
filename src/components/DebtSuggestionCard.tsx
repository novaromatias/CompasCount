import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { DebtSuggestion } from '../types';
import { Ionicons } from '@expo/vector-icons';

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
      <View style={styles.topRow}>
        <View style={styles.participantsContainer}>
          <View style={styles.personBadge}>
            <Ionicons name="person-circle" size={20} color={colors.debtor} />
            <Text style={styles.personName} numberOfLines={1}>
              {suggestion.fromName}
            </Text>
          </View>

          <View style={styles.arrowContainer}>
            <Text style={styles.owesLabel}>le debe a</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primarySoft} />
          </View>

          <View style={styles.personBadge}>
            <Ionicons name="person-circle" size={20} color={colors.creditor} />
            <Text style={styles.personName} numberOfLines={1}>
              {suggestion.toName}
            </Text>
          </View>
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <Text style={styles.amountText}>
            {suggestion.amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.hintText}>Sugerencia calculada para saldar con mínimo de transferencias</Text>
        <TouchableOpacity
          style={styles.payButton}
          onPress={() => onPayPress(suggestion)}
          activeOpacity={0.8}
        >
          <Ionicons name="cash-outline" size={16} color={colors.white} style={{ marginRight: 6 }} />
          <Text style={styles.payButtonText}>Pagar</Text>
        </TouchableOpacity>
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
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  topRow: {
    marginBottom: 12,
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  personBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    maxWidth: '40%',
  },
  personName: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 6,
  },
  arrowContainer: {
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  owesLabel: {
    color: colors.textMuted,
    fontSize: 10,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginVertical: 4,
  },
  currencySymbol: {
    color: colors.primarySoft,
    fontSize: 22,
    fontWeight: '700',
    marginRight: 2,
  },
  amountText: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 12,
    marginTop: 4,
  },
  hintText: {
    color: colors.textMuted,
    fontSize: 11,
    flex: 1,
    marginRight: 8,
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
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  payButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
});
