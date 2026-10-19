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
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { TricountGroup, DebtSuggestion, Expense } from '../types';
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
        message: `¡Únete a mi grupo de gastos "${group.title}" en CompasCount! Código de acceso: ${group.shareCode}`,
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

  // Confirmar pago desde la sugerencia (monto sugerido o editado por el usuario)
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

  // Guardar pago manual general (quién pagó a quién libremente)
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Top Header */}
      <Header
        title={group.title}
        subtitle={`${group.participants.length} participantes • Código: ${group.shareCode}`}
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity onPress={handleShare} style={styles.headerShareBtn}>
            <Ionicons name="share-social" size={20} color={colors.primarySoft} />
          </TouchableOpacity>
        }
      />

      {/* Navigation Tabs (Gastos, Equilibrios, Sugerencias de Pagos) */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'expenses' && styles.tabButtonActive]}
          onPress={() => setActiveTab('expenses')}
        >
          <Ionicons
            name="receipt-outline"
            size={18}
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
        >
          <Ionicons
            name="pie-chart-outline"
            size={18}
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
        >
          <Ionicons
            name="swap-horizontal"
            size={18}
            color={activeTab === 'suggestions' ? colors.white : colors.textMuted}
          />
          <Text
            style={[styles.tabButtonText, activeTab === 'suggestions' && styles.tabButtonTextActive]}
          >
            Sugerencias ({financials.suggestions.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab 1: Gastos */}
      {activeTab === 'expenses' && (
        <View style={styles.tabContent}>
          {/* Total Group Spending Banner */}
          <View style={styles.spendingBanner}>
            <View>
              <Text style={styles.spendingLabel}>Gasto Total Acumulado</Text>
              <Text style={styles.spendingAmount}>
                ${financials.totalGroupSpending.toLocaleString('es-AR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
            <View style={styles.expenseCountBadge}>
              <Text style={styles.expenseCountText}>
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
                <Ionicons name="cart-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>No hay gastos registrados</Text>
                <Text style={styles.emptySubtitle}>
                  Toca el botón "+" para registrar el primer gasto del grupo.
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
            <Ionicons name="add" size={26} color={colors.white} />
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
              <Text style={styles.sectionHeaderTitle}>
                Estado de cuentas por persona (verde = a favor, rojo = debe)
              </Text>
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
                Mínimo número de transferencias calculadas
              </Text>
            </View>

            <TouchableOpacity
              style={styles.generalPayBtn}
              onPress={() => setIsRegisterPaymentVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={16} color={colors.primarySoft} />
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
                <Ionicons name="checkmark-done-circle" size={64} color={colors.creditor} />
                <Text style={styles.settledTitle}>¡Cuentas al día!</Text>
                <Text style={styles.settledSubtitle}>
                  No hay deudas pendientes entre los participantes. Todo está equilibrado.
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
    fontSize: 16,
  },
  headerShareBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: colors.card,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
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
  spendingBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.cardSecondary,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 6,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorderGlow,
  },
  spendingLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  spendingAmount: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  expenseCountBadge: {
    backgroundColor: colors.card,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  expenseCountText: {
    color: colors.primarySoft,
    fontSize: 12,
    fontWeight: '600',
  },
  listPadding: {
    padding: 16,
    paddingBottom: 90,
  },
  sectionHeaderTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 10,
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
  },
  suggestionsSub: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  generalPayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.primaryGlow,
    gap: 6,
  },
  generalPayBtnText: {
    color: colors.primarySoft,
    fontSize: 12,
    fontWeight: '700',
  },
  settledContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  settledTitle: {
    color: colors.creditor,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 16,
  },
  settledSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
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
