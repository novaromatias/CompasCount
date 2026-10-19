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
      setNote(`Pago de deuda sugerida`);
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
                  <Ionicons name="card-outline" size={24} color={colors.primary} />
                  <Text style={styles.title}>Registrar Pago</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={22} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Transfer Details Card */}
              <View style={styles.routeCard}>
                <View style={styles.personCol}>
                  <Text style={styles.roleLabel}>Paga</Text>
                  <Text style={styles.personName} numberOfLines={1}>
                    {suggestion.fromName}
                  </Text>
                </View>

                <Ionicons name="arrow-forward-circle" size={28} color={colors.primarySoft} />

                <View style={styles.personCol}>
                  <Text style={styles.roleLabel}>Recibe</Text>
                  <Text style={styles.personName} numberOfLines={1}>
                    {suggestion.toName}
                  </Text>
                </View>
              </View>

              {/* Editable Amount */}
              <View style={styles.fieldContainer}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Monto sugerido (editable)</Text>
                  <Text style={styles.subLabel}>Sugerido: ${suggestion.amount}</Text>
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
                    autoFocus
                  />
                </View>
              </View>

              {/* Note / Concept */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Concepto / Nota (opcional)</Text>
                <TextInput
                  style={styles.noteInput}
                  value={note}
                  onChangeText={setNote}
                  placeholder="Ej: Transferencia bancaria, efectivo, etc."
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}

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
    backgroundColor: 'rgba(5, 3, 10, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 10,
  },
  closeBtn: {
    padding: 4,
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  personCol: {
    flex: 1,
    alignItems: 'center',
  },
  roleLabel: {
    color: colors.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  personName: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  subLabel: {
    color: colors.primarySoft,
    fontSize: 11,
    fontWeight: '500',
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  currencyPrefix: {
    color: colors.primarySoft,
    fontSize: 24,
    fontWeight: '700',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    color: colors.white,
    fontSize: 24,
    fontWeight: '800',
    paddingVertical: 10,
  },
  noteInput: {
    backgroundColor: colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    color: colors.white,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorText: {
    color: colors.debtor,
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  confirmBtn: {
    flex: 1.5,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
