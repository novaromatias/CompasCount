import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { TricountGroup, SplitType, ExpensePayer, ExpenseSplit, Expense } from '../types';
import { getGroupById, addExpenseToGroup, updateExpenseInGroup, deleteExpenseFromGroup } from '../services/storage';
import { Header } from '../components/Header';
import { Ionicons } from '@expo/vector-icons';

interface AddExpenseScreenProps {
  route: any;
  navigation: any;
}

export const AddExpenseScreen: React.FC<AddExpenseScreenProps> = ({ route, navigation }) => {
  const { groupId, expenseId } = route.params || {};
  const isEditing = Boolean(expenseId);

  const [group, setGroup] = useState<TricountGroup | null>(null);
  const [existingExpense, setExistingExpense] = useState<Expense | null>(null);

  const [title, setTitle] = useState('');
  const [totalAmountStr, setTotalAmountStr] = useState('');
  const [isMultiplePayers, setIsMultiplePayers] = useState(false);
  const [singlePayerId, setSinglePayerId] = useState<string>('');
  const [payerAmounts, setPayerAmounts] = useState<Record<string, string>>({});

  // Split type: EQUAL vs EXACT
  const [splitType, setSplitType] = useState<SplitType>('EQUAL');
  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState<string[]>([]);
  const [exactSplitAmounts, setExactSplitAmounts] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const g = await getGroupById(groupId);
      if (g) {
        setGroup(g);

        if (isEditing) {
          const exp = g.expenses.find((e) => e.id === expenseId);
          if (exp) {
            setExistingExpense(exp);
            setTitle(exp.title);
            setTotalAmountStr(exp.totalAmount.toString());

            // Cargar pagadores
            if (exp.payers.length === 1) {
              setIsMultiplePayers(false);
              setSinglePayerId(exp.payers[0].participantId);
            } else {
              setIsMultiplePayers(true);
              const pMap: Record<string, string> = {};
              exp.payers.forEach((p) => {
                pMap[p.participantId] = p.amount.toString();
              });
              setPayerAmounts(pMap);
            }

            // Cargar participantes del reparto
            setSplitType(exp.splitType);
            if (exp.splitType === 'EQUAL') {
              setSelectedBeneficiaries(exp.splits.map((s) => s.participantId));
            } else {
              const sMap: Record<string, string> = {};
              exp.splits.forEach((s) => {
                sMap[s.participantId] = s.amount.toString();
              });
              setExactSplitAmounts(sMap);
            }
          }
        } else {
          // Creación de nuevo gasto
          if (g.participants.length > 0) {
            setSinglePayerId(g.participants[0].id);
            setSelectedBeneficiaries(g.participants.map((p) => p.id));
          }
        }
      }
    }
    load();
  }, [groupId, expenseId, isEditing]);

  const toggleBeneficiary = (participantId: string) => {
    if (selectedBeneficiaries.includes(participantId)) {
      if (selectedBeneficiaries.length === 1) {
        Alert.alert('Atención', 'Al menos una persona debe participar en el reparto');
        return;
      }
      setSelectedBeneficiaries(selectedBeneficiaries.filter((id) => id !== participantId));
    } else {
      setSelectedBeneficiaries([...selectedBeneficiaries, participantId]);
    }
  };

  const handleSave = async () => {
    if (!group) return;
    if (!title.trim()) {
      setError('Por favor escribe un concepto para el gasto');
      return;
    }
    const total = parseFloat(totalAmountStr.replace(',', '.'));
    if (isNaN(total) || total <= 0) {
      setError('Por favor ingresa un monto total válido');
      return;
    }

    // 1. Armar pagadores
    let payers: ExpensePayer[] = [];
    if (!isMultiplePayers) {
      if (!singlePayerId) {
        setError('Selecciona quién pagó el gasto');
        return;
      }
      payers = [{ participantId: singlePayerId, amount: total }];
    } else {
      let sumPaid = 0;
      for (const p of group.participants) {
        const val = parseFloat((payerAmounts[p.id] || '0').replace(',', '.'));
        if (val > 0) {
          payers.push({ participantId: p.id, amount: val });
          sumPaid += val;
        }
      }
      if (Math.abs(sumPaid - total) > 0.05) {
        setError(`La suma de los pagos ($${sumPaid.toFixed(2)}) debe coincidir con el total ($${total.toFixed(2)})`);
        return;
      }
    }

    // 2. Armar repartos (para quiénes es este concepto)
    let splits: ExpenseSplit[] = [];
    if (splitType === 'EQUAL') {
      if (selectedBeneficiaries.length === 0) {
        setError('Debes seleccionar al menos un participante para el reparto');
        return;
      }
      const count = selectedBeneficiaries.length;
      const equalShare = Math.round((total / count) * 100) / 100;
      let runningTotal = 0;

      splits = selectedBeneficiaries.map((id, index) => {
        if (index === count - 1) {
          const lastShare = Math.round((total - runningTotal) * 100) / 100;
          return { participantId: id, amount: lastShare };
        }
        runningTotal += equalShare;
        return { participantId: id, amount: equalShare };
      });
    } else {
      // Reparto Exacto
      let sumSplit = 0;
      for (const p of group.participants) {
        const val = parseFloat((exactSplitAmounts[p.id] || '0').replace(',', '.'));
        if (val > 0) {
          splits.push({ participantId: p.id, amount: val });
          sumSplit += val;
        }
      }
      if (Math.abs(sumSplit - total) > 0.05) {
        setError(`La suma de las partes ($${sumSplit.toFixed(2)}) debe igualar el total ($${total.toFixed(2)})`);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      if (isEditing && expenseId) {
        await updateExpenseInGroup(group.id, expenseId, {
          title: title.trim(),
          totalAmount: total,
          splitType,
          expenseDate: existingExpense ? existingExpense.expenseDate : new Date().toISOString(),
          payers,
          splits,
        });
      } else {
        await addExpenseToGroup(group.id, {
          title: title.trim(),
          totalAmount: total,
          splitType,
          expenseDate: new Date().toISOString(),
          payers,
          splits,
        });
      }

      navigation.goBack();
    } catch (err: any) {
      setError(err?.message || 'Error al guardar el gasto');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!group || !expenseId) return;

    const executeDelete = async () => {
      try {
        setLoading(true);
        await deleteExpenseFromGroup(group.id, expenseId);
        navigation.goBack();
      } catch (err: any) {
        Alert.alert('Error', err?.message || 'No se pudo eliminar el gasto');
      } finally {
        setLoading(false);
      }
    };

    if (Alert.alert) {
      Alert.alert(
        'Eliminar Concepto',
        '¿Estás seguro de que deseas eliminar este gasto? Todos los balances y sugerencias se recalcularán automáticamente.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: executeDelete },
        ]
      );
    } else {
      executeDelete();
    }
  };

  if (!group) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <Header
        title={isEditing ? 'Editar Concepto' : 'Nuevo Gasto'}
        subtitle={isEditing ? 'Modifica nombre, monto o participantes' : undefined}
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          isEditing ? (
            <TouchableOpacity onPress={handleDelete} style={styles.deleteHeaderBtn}>
              <Ionicons name="trash-outline" size={20} color={colors.debtor} />
            </TouchableOpacity>
          ) : undefined
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* 1. Nombre del Concepto y Monto Total */}
        <View style={styles.card}>
          <Text style={styles.label}>Nombre del concepto *</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={(t) => {
              setTitle(t);
              setError(null);
            }}
            placeholder="Ej: Almuerzo, Supermercado, Nafta..."
            placeholderTextColor={colors.textMuted}
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Monto total ($) *</Text>
          <View style={styles.amountInputRow}>
            <Text style={styles.currencyPrefix}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={totalAmountStr}
              onChangeText={(t) => {
                setTotalAmountStr(t);
                setError(null);
              }}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        {/* 2. Quién pagó (Participantes pagadores) */}
        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <View>
              <Text style={styles.sectionTitle}>¿Quién pagó el dinero?</Text>
              <Text style={styles.sectionSubtitle}>Define quién o quiénes pusieron el dinero</Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsMultiplePayers(!isMultiplePayers)}
              style={styles.toggleBtn}
            >
              <Text style={styles.toggleBtnText}>
                {isMultiplePayers ? 'Un solo pagador' : 'Múltiples'}
              </Text>
            </TouchableOpacity>
          </View>

          {!isMultiplePayers ? (
            <View style={styles.chipsWrap}>
              {group.participants.map((p) => {
                const isSelected = p.id === singlePayerId;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => setSinglePayerId(p.id)}
                  >
                    <Ionicons
                      name="person"
                      size={14}
                      color={isSelected ? colors.white : colors.textMuted}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {p.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.multiPayersContainer}>
              <Text style={styles.hintSub}>
                Ingresa cuánto pagó cada persona (la suma debe igualar el monto total):
              </Text>
              {group.participants.map((p) => (
                <View key={p.id} style={styles.personInputRow}>
                  <Text style={styles.personLabel}>{p.name}</Text>
                  <View style={styles.miniInputWrapper}>
                    <Text style={styles.miniCurrency}>$</Text>
                    <TextInput
                      style={styles.miniInput}
                      placeholder="0.00"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      value={payerAmounts[p.id] || ''}
                      onChangeText={(val) => {
                        setPayerAmounts({ ...payerAmounts, [p.id]: val });
                        setError(null);
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 3. Para quién (Participantes del reparto) */}
        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <View>
              <Text style={styles.sectionTitle}>Participantes del concepto</Text>
              <Text style={styles.sectionSubtitle}>¿Entre quiénes se divide este gasto?</Text>
            </View>
            <View style={styles.splitToggleRow}>
              <TouchableOpacity
                style={[styles.modeBtn, splitType === 'EQUAL' && styles.modeBtnActive]}
                onPress={() => setSplitType('EQUAL')}
              >
                <Text
                  style={[styles.modeBtnText, splitType === 'EQUAL' && styles.modeBtnTextActive]}
                >
                  Partes iguales
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeBtn, splitType === 'EXACT' && styles.modeBtnActive]}
                onPress={() => setSplitType('EXACT')}
              >
                <Text
                  style={[styles.modeBtnText, splitType === 'EXACT' && styles.modeBtnTextActive]}
                >
                  Exacto
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {splitType === 'EQUAL' ? (
            <View>
              <Text style={styles.hintSub}>
                Selecciona qué amigos participan en este gasto (toca para activar/desactivar):
              </Text>
              <View style={styles.chipsWrap}>
                {group.participants.map((p) => {
                  const isChecked = selectedBeneficiaries.includes(p.id);
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.chip, isChecked && styles.chipBeneficiarySelected]}
                      onPress={() => toggleBeneficiary(p.id)}
                    >
                      <Ionicons
                        name={isChecked ? 'checkmark-circle' : 'ellipse-outline'}
                        size={16}
                        color={isChecked ? colors.white : colors.textMuted}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={[styles.chipText, isChecked && styles.chipTextSelected]}>
                        {p.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : (
            <View style={styles.multiPayersContainer}>
              <Text style={styles.hintSub}>
                Ingresa cuánto le corresponde pagar a cada uno de forma exacta:
              </Text>
              {group.participants.map((p) => (
                <View key={p.id} style={styles.personInputRow}>
                  <Text style={styles.personLabel}>{p.name}</Text>
                  <View style={styles.miniInputWrapper}>
                    <Text style={styles.miniCurrency}>$</Text>
                    <TextInput
                      style={styles.miniInput}
                      placeholder="0.00"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      value={exactSplitAmounts[p.id] || ''}
                      onChangeText={(val) => {
                        setExactSplitAmounts({ ...exactSplitAmounts, [p.id]: val });
                        setError(null);
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Botón Guardar / Actualizar */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.btnDisabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Ionicons
            name={isEditing ? 'save-outline' : 'checkmark-sharp'}
            size={20}
            color={colors.white}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.saveButtonText}>
            {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Guardar Gasto'}
          </Text>
        </TouchableOpacity>

        {/* Botón Eliminar si se está editando */}
        {isEditing && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={18} color={colors.debtor} style={{ marginRight: 6 }} />
            <Text style={styles.deleteButtonText}>Eliminar este concepto</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    color: colors.white,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 16,
  },
  currencyPrefix: {
    color: colors.primarySoft,
    fontSize: 26,
    fontWeight: '700',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    color: colors.white,
    fontSize: 26,
    fontWeight: '800',
    paddingVertical: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.backgroundSecondary,
  },
  toggleBtnText: {
    color: colors.primarySoft,
    fontSize: 12,
    fontWeight: '600',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primarySoft,
  },
  chipBeneficiarySelected: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primary,
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
  hintSub: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 12,
  },
  multiPayersContainer: {
    marginTop: 6,
  },
  personInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  personLabel: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  miniInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 10,
    width: 130,
  },
  miniCurrency: {
    color: colors.primarySoft,
    fontSize: 14,
    fontWeight: '700',
    marginRight: 4,
  },
  miniInput: {
    flex: 1,
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
    paddingVertical: 6,
  },
  splitToggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 3,
  },
  modeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
  },
  modeBtnActive: {
    backgroundColor: colors.primary,
  },
  modeBtnText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  modeBtnTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  errorText: {
    color: colors.debtor,
    fontSize: 13,
    marginBottom: 14,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 77, 109, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 109, 0.3)',
    marginTop: 14,
  },
  deleteButtonText: {
    color: colors.debtor,
    fontSize: 14,
    fontWeight: '600',
  },
  deleteHeaderBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: colors.card,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
