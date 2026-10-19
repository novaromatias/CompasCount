import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Share,
} from 'react-native';
import { colors } from '../theme/colors';
import { TricountGroup, DebtSuggestion } from '../types';
import { getGroupById, addPaymentToGroup } from '../services/storage';
import { calculateGroupFinancials } from '../utils/debtSimplifier';
import { Header } from '../components/Header';
import { ExpenseCard } from '../components/ExpenseCard';
import { BalanceCard } from '../components/BalanceCard';
import { DebtSuggestionCard } from '../components/DebtSuggestionCard';
import { PaymentModal } from '../components/PaymentModal';
import { RegisterPaymentModal } from '../components/RegisterPaymentModal';
import { Ionicons } from '@expo/vector-icons';

type TabType = 'expenses' | 'balances' | 'suggestions';

interface GroupDetailScreenProps {
  route: any;
  navigation: any;
}

export const GroupDetailScreen: React.FC<GroupDetailScreenProps> = ({ route, navigation }) => {
  const { groupId, title } = route.params;

  const [group, setGroup] = useState<TricountGroup | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('expenses');

  // Modals state
  const [selectedSuggestion, setSelectedSuggestion] = useState<DebtSuggestion | null>(null);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isRegisterPaymentVisible, setIsRegisterPaymentVisible] = useState(false);

  const loadGroup = useCallback(async () => {
    try {
      const data = await getGroupById(groupId);
      if (data) {
        setGroup(data);
      }
    } catch (err) {
      console.error('Error cargando grupo:', err);
    }
  }, [groupId]);

  useEffect(() => {
    loadGroup();
    const unsubscribe = navigation.addListener('focus', () => {
      loadGroup();
    });
    return unsubscribe;
  }, [navigation, loadGroup]);

  // Recalcular finanzas en tiempo real cada vez que cambia el grupo (gastos o pagos)
  const financials = useMemo(() => {
    if (!group) return { balances: [], suggestions: [], totalGroupSpending: 0 };
    return calculateGroupFinancials(group.participants, group.expenses, group.payments);
  }, [group]);

  // Compartir enlace o código de Tricount
  const handleShare = async () => {
    if (!group) return;
    try {
      await Share.share({
        message: `¡Únete a mi grupo "${group.title}" en CompasCount! Código de acceso: ${group.shareCode}`,
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Callback al tocar "Pagar" en una sugerencia específica
  const handlePayPress = (suggestion: DebtSuggestion) => {
    setSelectedSuggestion(suggestion);
    setIsPaymentModalVisible(true);
  };

  // Confirmar pago desde la sugerencia
  const handleConfirmSuggestedPayment = async (
    fromId: string,
    toId: string,
    amount: number,
    note?: string
  ) => {
    if (!group) return;
    await addPaymentToGroup(group.id, {
      fromParticipantId: fromId,
      toParticipantId: toId,
      amount,
      paymentDate: new Date().toISOString(),
      note: note || 'Pago sugerido saldado',
    });
    await loadGroup();
  };

  // Guardar pago manual general
  const handleSaveManualPayment = async (
    fromId: string,
    toId: string,
    amount: number,
    note?: string
  ) => {
    if (!group) return;
    await addPaymentToGroup(group.id, {
      fromParticipantId: fromId,
      toParticipantId: toId,
      amount,
      paymentDate: new Date().toISOString(),
      note: note || 'Pago manual registrado',
    });
    await loadGroup();
  };

  if (!group) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title={title || 'Cargando...'} showBack onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando datos del grupo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const averagePerPerson =
    group.participants.length > 0
      ? financials.totalGroupSpending / group.participants.length
      : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Top Header */}
      <Header
        title={group.title}
        subtitle={`${group.participants.length} compas • Código: ${group.shareCode}`}
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity onPress={handleShare} style={styles.headerShareBtn} activeOpacity={0.75}>
            <Ionicons name="share-social-outline" size={18} color={colors.primarySoft} />
          </TouchableOpacity>
        }
      />

      {/* Segmented Capsule Tabs */}
      <View style={styles.tabsOuter}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'expenses' && styles.tabButtonActive]}
            onPress={() => setActiveTab('expenses')}
            activeOpacity={0.8}
          >
            <Ionicons
              name={activeTab === 'expenses' ? 'receipt' : 'receipt-outline'}
              size={15}
              color={activeTab === 'expenses' ? colors.white : colors.textMuted}
            />
            <Text
              style={[styles.tabButtonText, activeTab === 'expenses' && styles.tabButtonTextActive]}
            >
              Gastos ({group.expenses.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'balances' && styles.tabButtonActive]}
            onPress={() => setActiveTab('balances')}
            activeOpacity={0.8}
          >
            <Ionicons
              name={activeTab === 'balances' ? 'pie-chart' : 'pie-chart-outline'}
              size={15}
              color={activeTab === 'balances' ? colors.white : colors.textMuted}
            />
            <Text
              style={[styles.tabButtonText, activeTab === 'balances' && styles.tabButtonTextActive]}
            >
              Equilibrios
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'suggestions' && styles.tabButtonActive]}
            onPress={() => setActiveTab('suggestions')}
            activeOpacity={0.8}
          >
            <Ionicons
              name={activeTab === 'suggestions' ? 'swap-horizontal' : 'swap-horizontal-outline'}
              size={15}
              color={activeTab === 'suggestions' ? colors.white : colors.textMuted}
            />
            <Text
              style={[styles.tabButtonText, activeTab === 'suggestions' && styles.tabButtonTextActive]}
            >
              Saldar ({financials.suggestions.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab 1: Gastos */}
      {activeTab === 'expenses' && (
        <View style={styles.tabContent}>
          {/* Spending Ledger Card */}
          <View style={styles.spendingCard}>
            <View style={styles.spendingMain}>
              <Text style={styles.spendingLabel}>Total Acumulado</Text>
              <View style={styles.spendingAmountRow}>
                <Text style={styles.currencyPrefix}>$</Text>
                <Text style={styles.spendingAmount}>
                  {financials.totalGroupSpending.toLocaleString('es-AR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.spendingDetailsCol}>
              <View style={styles.metricPill}>
                <Ionicons name="person-outline" size={11} color={colors.textSecondary} />
                <Text style={styles.metricPillText}>
                  ~${averagePerPerson.toLocaleString('es-AR', { maximumFractionDigits: 0 })}/persona
                </Text>
              </View>
              <Text style={styles.spendingSubInfo}>
                {group.expenses.length} gastos • {group.payments.length} pagos
              </Text>
            </View>
          </View>

          <FlatList
            data={group.expenses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ExpenseCard
                expense={item}
                participants={group.participants}
                onPress={(exp) =>
                  navigation.navigate('AddExpense', {
                    groupId: group.id,
                    expenseId: exp.id,
                  })
                }
              />
            )}
            contentContainerStyle={styles.listPadding}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="receipt-outline" size={36} color={colors.primarySoft} />
                </View>
                <Text style={styles.emptyTitle}>Aún no hay gastos en este grupo</Text>
                <Text style={styles.emptySubtitle}>
                  Toca el botón "+ Agregar Gasto" para registrar la primera cuenta compartida.
                </Text>
              </View>
            }
          />

          {/* Floating Action Button: Añadir Gasto */}
          <TouchableOpacity
            style={styles.fab}
            onPress={() => navigation.navigate('AddExpense', { groupId: group.id })}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={24} color={colors.white} />
            <Text style={styles.fabText}>Agregar Gasto</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tab 2: Equilibrios / Saldos */}
      {activeTab === 'balances' && (
        <View style={styles.tabContent}>
          <FlatList
            data={financials.balances}
            keyExtractor={(item) => item.participantId}
            renderItem={({ item }) => <BalanceCard balance={item} />}
            contentContainerStyle={styles.listPadding}
            ListHeaderComponent={
              <View style={styles.balancesHeaderInfo}>
                <Ionicons name="information-circle-outline" size={15} color={colors.textSecondary} />
                <Text style={styles.sectionHeaderTitle}>
                  Balance neto por persona (verde = a favor, rosa = debe)
                </Text>
              </View>
            }
          />
        </View>
      )}

      {/* Tab 3: Sugerencias de Pagos */}
      {activeTab === 'suggestions' && (
        <View style={styles.tabContent}>
          {/* Subheader con botón general Registrar Pago */}
          <View style={styles.suggestionsHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.suggestionsTitle}>Cómo saldar las cuentas</Text>
              <Text style={styles.suggestionsSub}>
                Mínimo de pagos calculado automáticamente
              </Text>
            </View>

            <TouchableOpacity
              style={styles.generalPayBtn}
              onPress={() => setIsRegisterPaymentVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={16} color={colors.primary} />
              <Text style={styles.generalPayBtnText}>Registrar Pago</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={financials.suggestions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <DebtSuggestionCard suggestion={item} onPayPress={handlePayPress} />
            )}
            contentContainerStyle={styles.listPadding}
            ListEmptyComponent={
              <View style={styles.settledContainer}>
                <View style={styles.settledIconCircle}>
                  <Ionicons name="checkmark-done" size={44} color={colors.creditor} />
                </View>
                <Text style={styles.settledTitle}>¡Cuentas equilibradas!</Text>
                <Text style={styles.settledSubtitle}>
                  No hay deudas pendientes entre los participantes. Todo el grupo está al día.
                </Text>
              </View>
            }
          />
        </View>
      )}

      {/* Modal interactivo al tocar "Pagar" en una sugerencia */}
      <PaymentModal
        visible={isPaymentModalVisible}
        suggestion={selectedSuggestion}
        onClose={() => setIsPaymentModalVisible(false)}
        onConfirmPayment={handleConfirmSuggestedPayment}
      />

      {/* Modal para registrar un pago manual libre */}
      <RegisterPaymentModal
        visible={isRegisterPaymentVisible}
        participants={group.participants}
        onClose={() => setIsRegisterPaymentVisible(false)}
        onSavePayment={handleSaveManualPayment}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  headerShareBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsOuter: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 11,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: colors.cardSecondary,
    borderWidth: 1,
    borderColor: colors.cardBorderGlow,
  },
  tabButtonText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  tabContent: {
    flex: 1,
  },
  spendingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.cardSecondary,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 6,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorderGlow,
  },
  spendingMain: {
    flex: 1,
  },
  spendingLabel: {
    color: colors.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  spendingAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  currencyPrefix: {
    color: colors.primarySoft,
    fontSize: 16,
    fontWeight: '700',
    marginRight: 2,
  },
  spendingAmount: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  spendingDetailsCol: {
    alignItems: 'flex-end',
    gap: 5,
  },
  metricPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 4,
  },
  metricPillText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  spendingSubInfo: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  listPadding: {
    padding: 16,
    paddingBottom: 95,
  },
  balancesHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionHeaderTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  suggestionsTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  suggestionsSub: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  generalPayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorderGlow,
    gap: 6,
  },
  generalPayBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  settledContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  settledIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.creditorSoft,
    borderWidth: 1,
    borderColor: colors.creditor,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  settledTitle: {
    color: colors.creditor,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  settledSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 270,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.cardSecondary,
    borderWidth: 1,
    borderColor: colors.cardBorderGlow,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 270,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 30,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
    gap: 8,
  },
  fabText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
