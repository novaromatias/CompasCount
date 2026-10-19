import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { colors } from '../theme/colors';
import { TricountGroup } from '../types';
import { getStoredGroups } from '../services/storage';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import { LoginModal } from '../components/LoginModal';

interface GroupsListScreenProps {
  navigation: any;
}

export const GroupsListScreen: React.FC<GroupsListScreenProps> = ({ navigation }) => {
  const { user, isGuest } = useAuth();
  const [groups, setGroups] = useState<TricountGroup[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await getStoredGroups();
      setGroups(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderGroupItem = ({ item }: { item: TricountGroup }) => {
    const totalExpenses = item.expenses.reduce((acc, exp) => acc + exp.totalAmount, 0);
    const visibleParticipants = item.participants.slice(0, 3);
    const extraCount = item.participants.length - 3;

    return (
      <TouchableOpacity
        style={styles.groupCard}
        onPress={() => navigation.navigate('GroupDetail', { groupId: item.id, title: item.title })}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleInfo}>
            <Text style={styles.groupTitle} numberOfLines={1}>
              {item.title}
            </Text>
            {item.description ? (
              <Text style={styles.groupDesc} numberOfLines={1}>
                {item.description}
              </Text>
            ) : null}
          </View>

          <View style={styles.codeTag}>
            <Ionicons name="share-social-outline" size={13} color={colors.primarySoft} />
            <Text style={styles.codeText}>{item.shareCode}</Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardFooter}>
          {/* Overlapping Avatar Stack */}
          <View style={styles.participantsSection}>
            <View style={styles.avatarStack}>
              {visibleParticipants.map((p, idx) => (
                <View
                  key={p.id}
                  style={[
                    styles.stackedAvatarWrap,
                    { left: idx * 20, zIndex: 10 - idx },
                  ]}
                >
                  <Avatar name={p.name} size="sm" showBorder />
                </View>
              ))}
              {extraCount > 0 && (
                <View
                  style={[
                    styles.extraBadge,
                    { left: visibleParticipants.length * 20, zIndex: 5 },
                  ]}
                >
                  <Text style={styles.extraBadgeText}>+{extraCount}</Text>
                </View>
              )}
            </View>

            <Text
              style={[
                styles.participantsCountLabel,
                { marginLeft: (Math.min(item.participants.length, 3) + (extraCount > 0 ? 1 : 0)) * 20 + 10 },
              ]}
            >
              {item.participants.length} compas
            </Text>
          </View>

          {/* Total Expense amount */}
          <View style={styles.totalBlock}>
            <Text style={styles.totalLabel}>Gasto total</Text>
            <Text style={styles.totalAmount}>
              ${totalExpenses.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Top App Bar */}
      <View style={styles.appHeader}>
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <Ionicons name="pie-chart" size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.brandName}>CompasCount</Text>
            <Text style={styles.brandTagline}>Cuentas claras entre amigos</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.userBadge}
          onPress={() => setIsLoginModalVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isGuest ? 'person-circle-outline' : 'logo-google'}
            size={16}
            color={isGuest ? colors.primarySoft : '#4285F4'}
          />
          <Text style={styles.userBadgeText}>
            {isGuest ? 'Invitado' : user?.name.split(' ')[0] || 'Conectado'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={renderGroupItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <View style={styles.heroCard}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroTitle}>Tus grupos de gastos</Text>
              <Text style={styles.heroSubtitle}>
                {groups.length} {groups.length === 1 ? 'grupo activo' : 'grupos activos'} • 100% offline
              </Text>
            </View>
            <View style={styles.offlineStatusPill}>
              <View style={styles.offlineDot} />
              <Text style={styles.offlineText}>Listo offline</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="people-outline" size={40} color={colors.primarySoft} />
            </View>
            <Text style={styles.emptyTitle}>Sin grupos creados aún</Text>
            <Text style={styles.emptySubtitle}>
              Crea tu primer grupo para un viaje, cena, asado o los gastos de convivencia.
            </Text>
            <TouchableOpacity
              style={styles.emptyCtaBtn}
              onPress={() => navigation.navigate('CreateGroup')}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={18} color={colors.white} style={{ marginRight: 6 }} />
              <Text style={styles.emptyCtaText}>Crear mi primer grupo</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Floating Action Button: Nuevo Grupo */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateGroup')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={24} color={colors.white} />
        <Text style={styles.fabText}>Nuevo Grupo</Text>
      </TouchableOpacity>

      {/* Modal de Inicio / Gestión de Sesión */}
      <LoginModal
        visible={isLoginModalVisible}
        onClose={() => setIsLoginModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorderGlow,
  },
  brandName: {
    color: colors.white,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  brandTagline: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 5,
  },
  userBadgeText: {
    color: colors.primarySoft,
    fontSize: 11,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 95,
  },
  heroCard: {
    backgroundColor: colors.cardSecondary,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorderGlow,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLeft: {
    flex: 1,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  offlineStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.creditorSoft,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.creditor,
    gap: 5,
  },
  offlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.creditor,
  },
  offlineText: {
    color: colors.creditor,
    fontSize: 10,
    fontWeight: '700',
  },
  groupCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleInfo: {
    flex: 1,
    marginRight: 10,
  },
  groupTitle: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  groupDesc: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  codeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  codeText: {
    color: colors.primarySoft,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    position: 'relative',
    height: 30,
  },
  avatarStack: {
    position: 'absolute',
    left: 0,
    top: 2,
    height: 26,
  },
  stackedAvatarWrap: {
    position: 'absolute',
    top: 0,
  },
  extraBadge: {
    position: 'absolute',
    top: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.cardSecondary,
    borderWidth: 2,
    borderColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  extraBadgeText: {
    color: colors.primarySoft,
    fontSize: 10,
    fontWeight: '700',
  },
  participantsCountLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  totalBlock: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  totalAmount: {
    color: colors.primarySoft,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.cardSecondary,
    borderWidth: 1,
    borderColor: colors.cardBorderGlow,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 280,
    marginTop: 6,
    lineHeight: 18,
  },
  emptyCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 20,
  },
  emptyCtaText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
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
