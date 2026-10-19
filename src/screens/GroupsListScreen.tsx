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
import { Header } from '../components/Header';
import { Ionicons } from '@expo/vector-icons';

interface GroupsListScreenProps {
  navigation: any;
}

export const GroupsListScreen: React.FC<GroupsListScreenProps> = ({ navigation }) => {
  const [groups, setGroups] = useState<TricountGroup[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isGuest, setIsGuest] = useState(true);

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

    return (
      <TouchableOpacity
        style={styles.groupCard}
        onPress={() => navigation.navigate('GroupDetail', { groupId: item.id, title: item.title })}
        activeOpacity={0.8}
      >
        <View style={styles.groupTopRow}>
          <View style={styles.groupTitleWrap}>
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
            <Ionicons name="share-social-outline" size={12} color={colors.primarySoft} />
            <Text style={styles.codeText}>{item.shareCode}</Text>
          </View>
        </View>

        <View style={styles.groupBottomRow}>
          <View style={styles.participantsBadge}>
            <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.participantsText}>
              {item.participants.length} participantes
            </Text>
          </View>

          <View style={styles.totalWrap}>
            <Text style={styles.totalLabel}>Gasto total:</Text>
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
      
      {/* Top App Header with User Mode */}
      <View style={styles.appHeader}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Ionicons name="pie-chart" size={22} color={colors.primary} />
          </View>
          <Text style={styles.logoText}>CompasCount</Text>
        </View>

        <View style={styles.userBadge}>
          <Ionicons
            name={isGuest ? 'person-circle-outline' : 'logo-google'}
            size={18}
            color={colors.primarySoft}
          />
          <Text style={styles.userBadgeText}>
            {isGuest ? 'Modo Invitado' : 'Conectado'}
          </Text>
        </View>
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
          <View style={styles.banner}>
            <View>
              <Text style={styles.bannerTitle}>Tus Grupos de Gastos</Text>
              <Text style={styles.bannerSubtitle}>
                Divide cuentas con amigos, sin registrarte y 100% offline.
              </Text>
            </View>
            <View style={styles.offlinePill}>
              <View style={styles.offlineDot} />
              <Text style={styles.offlineText}>Listo offline</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={54} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Aún no tienes grupos</Text>
            <Text style={styles.emptySubtitle}>
              Crea uno nuevo para tu próximo viaje, cena o gastos de casa.
            </Text>
          </View>
        }
      />

      {/* Floating Action Button: Crear Grupo */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateGroup')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={colors.white} />
        <Text style={styles.fabText}>Nuevo Grupo</Text>
      </TouchableOpacity>
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
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primaryGlow,
  },
  logoText: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 6,
  },
  userBadgeText: {
    color: colors.primarySoft,
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 90,
  },
  banner: {
    backgroundColor: colors.cardSecondary,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.cardBorderGlow,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bannerTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    maxWidth: 240,
  },
  offlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(41, 204, 136, 0.15)',
    paddingHorizontal: 8,
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
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  groupTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  groupTitleWrap: {
    flex: 1,
    marginRight: 10,
  },
  groupTitle: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
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
  groupBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 12,
  },
  participantsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  participantsText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  totalWrap: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    color: colors.textMuted,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  totalAmount: {
    color: colors.primarySoft,
    fontSize: 16,
    fontWeight: '800',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 14,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 260,
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
