import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';
import { DebtSuggestion } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from './Avatar';

interface PaymentModalProps {
  visible: boolean;
  suggestion: DebtSuggestion | null;
  onClose: () => void;
  onConfirmPayment: (
    fromId: string,
    toId: string,
    amount: number,
    note?: string
  ) => Promise<void>;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  suggestion,
  onClose,
  onConfirmPayment,
}) => {
  const [amountStr, setAmountStr] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (suggestion) {
      setAmountStr(suggestion.amount.toString());
      setNote(`Pago de deuda saldada`);
      setError(null);
    }
  }, [suggestion]);

  const handleConfirm = async () => {
    if (!suggestion) return;
    const num = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(num) || num <= 0) {
      setError('Por favor ingresa un monto válido mayor a 0');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onConfirmPayment(suggestion.fromId, suggestion.toId, num, note);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  if (!suggestion) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.modalContent}
            >
              <View style={styles.header}>
                <View style={styles.titleRow}>
                  <Ionicons name="swap-horizontal" size={22} color={colors.primary} />
                  <Text style={styles.title}>Registrar Pago</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Transfer Details Card with Avatars */}
              <View style={styles.routeCard}>
                <View style={styles.personCol}>
                  <Avatar name={suggestion.fromName} size="md" />
                  <Text style={styles.roleLabel}>Paga</Text>
                  <Text style={styles.personName} numberOfLines={1}>
                    {suggestion.fromName}
                  </Text>
                </View>

                <View style={styles.arrowCenter}>
                  <Ionicons name="arrow-forward" size={22} color={colors.primarySoft} />
                </View>

                <View style={styles.personCol}>
                  <Avatar name={suggestion.toName} size="md" />
                  <Text style={styles.roleLabel}>Recibe</Text>
                  <Text style={styles.personName} numberOfLines={1}>
                    {suggestion.toName}
                  </Text>
                </View>
              </View>

              {/* Editable Amount */}
              <View style={styles.fieldContainer}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Monto a transferir ($)</Text>
                  <Text style={styles.subLabel}>Sugerido: ${suggestion.amount.toFixed(2)}</Text>
                </View>
                <View style={styles.amountInputWrapper}>
                  <Text style={styles.currencyPrefix}>$</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={amountStr}
                    onChangeText={(val) => {
                      setAmountStr(val);
                      setError(null);
                    }}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              {/* Note / Concept */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Concepto / Método (opcional)</Text>
                <TextInput
                  style={styles.noteInput}
                  value={note}
                  onChangeText={setNote}
                  placeholder="Ej: Transferencia bancaria, efectivo, MercadoPago"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              {error && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={15} color={colors.debtor} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={onClose}
                  disabled={loading}
                >
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.confirmBtn, loading && styles.btnDisabled]}
                  onPress={handleConfirm}
                  disabled={loading}
                >
                  <Text style={styles.confirmBtnText}>
                    {loading ? 'Guardando...' : 'Confirmar Pago'}
                  </Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 7, 15, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 22,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  personCol: {
    alignItems: 'center',
    flex: 1,
  },
  arrowCenter: {
    paddingHorizontal: 8,
  },
  roleLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 6,
  },
  personName: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  fieldContainer: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  subLabel: {
    color: colors.primarySoft,
    fontSize: 11,
    fontWeight: '600',
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorderGlow,
    paddingHorizontal: 12,
  },
  currencyPrefix: {
    color: colors.primarySoft,
    fontSize: 20,
    fontWeight: '700',
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
    paddingVertical: 10,
  },
  noteInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    color: colors.white,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.debtorSoft,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.debtor,
    marginBottom: 14,
    gap: 6,
  },
  errorText: {
    color: colors.debtor,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
