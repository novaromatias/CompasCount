import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';
import { Participant } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from './Avatar';

interface RegisterPaymentModalProps {
  visible: boolean;
  participants: Participant[];
  onClose: () => void;
  onSavePayment: (
    fromId: string,
    toId: string,
    amount: number,
    note?: string
  ) => Promise<void>;
}

export const RegisterPaymentModal: React.FC<RegisterPaymentModalProps> = ({
  visible,
  participants,
  onClose,
  onSavePayment,
}) => {
  const [fromId, setFromId] = useState<string>(participants[0]?.id || '');
  const [toId, setToId] = useState<string>(participants[1]?.id || '');
  const [amountStr, setAmountStr] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!fromId || !toId) {
      setError('Debes seleccionar quién pagó y quién recibió');
      return;
    }
    if (fromId === toId) {
      setError('El pagador y el receptor no pueden ser la misma persona');
      return;
    }
    const num = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(num) || num <= 0) {
      setError('Por favor ingresa un monto válido mayor a 0');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSavePayment(fromId, toId, num, note);
      // Reset
      setAmountStr('');
      setNote('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error al registrar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
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
                  <Text style={styles.title}>Registrar Pago Manual</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Selector: Quién pagó */}
                <Text style={styles.sectionLabel}>¿Quién pagó el dinero?</Text>
                <View style={styles.chipsContainer}>
                  {participants.map((p) => {
                    const isSelected = p.id === fromId;
                    return (
                      <TouchableOpacity
                        key={p.id}
                        style={[styles.chip, isSelected && styles.chipSelectedFrom]}
                        onPress={() => {
                          setFromId(p.id);
                          setError(null);
                        }}
                        activeOpacity={0.8}
                      >
                        <Avatar name={p.name} size="sm" />
                        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                          {p.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Selector: Quién recibió */}
                <Text style={styles.sectionLabel}>¿Quién lo recibió?</Text>
                <View style={styles.chipsContainer}>
                  {participants.map((p) => {
                    const isSelected = p.id === toId;
                    return (
                      <TouchableOpacity
                        key={p.id}
                        style={[styles.chip, isSelected && styles.chipSelectedTo]}
                        onPress={() => {
                          setToId(p.id);
                          setError(null);
                        }}
                        activeOpacity={0.8}
                      >
                        <Avatar name={p.name} size="sm" />
                        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                          {p.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Monto */}
                <Text style={styles.sectionLabel}>Monto pagado ($)</Text>
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

                {/* Concepto opcional */}
                <Text style={styles.sectionLabel}>Nota o método (opcional)</Text>
                <TextInput
                  style={styles.noteInput}
                  value={note}
                  onChangeText={setNote}
                  placeholder="Ej: Pago en efectivo, transferencia, etc."
                  placeholderTextColor={colors.textMuted}
                />

                {error && (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={15} color={colors.debtor} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                {/* Botones de acción */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={onClose}
                    disabled={loading}
                  >
                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.saveBtn, loading && styles.btnDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                  >
                    <Text style={styles.saveBtnText}>
                      {loading ? 'Guardando...' : 'Guardar Pago'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
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
    padding: 16,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 22,
    width: '100%',
    maxWidth: 440,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
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
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 6,
    paddingRight: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 6,
  },
  chipSelectedFrom: {
    backgroundColor: colors.debtorSoft,
    borderColor: colors.debtor,
  },
  chipSelectedTo: {
    backgroundColor: colors.creditorSoft,
    borderColor: colors.creditor,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: colors.white,
    fontWeight: '700',
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorderGlow,
    paddingHorizontal: 12,
    marginBottom: 4,
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
    marginBottom: 6,
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
    marginVertical: 10,
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
    marginTop: 14,
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
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  saveBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
