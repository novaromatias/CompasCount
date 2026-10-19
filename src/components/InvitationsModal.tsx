import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../theme/colors';
import { GroupInvitation, UserProfile } from '../types';
import { respondToInvitation } from '../services/invitationService';
import { Ionicons } from '@expo/vector-icons';

interface InvitationsModalProps {
  visible: boolean;
  invitations: GroupInvitation[];
  currentUser: UserProfile | null;
  onClose: () => void;
  onRefresh: () => void;
}

export const InvitationsModal: React.FC<InvitationsModalProps> = ({
  visible,
  invitations,
  currentUser,
  onClose,
  onRefresh,
}) => {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAction = async (invitationId: string, accept: boolean) => {
    if (!currentUser) return;
    try {
      setProcessingId(invitationId);
      await respondToInvitation(invitationId, accept, currentUser);
      onRefresh();
    } catch (error) {
      console.error('Error respondiendo invitación:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const renderItem = ({ item }: { item: GroupInvitation }) => {
    const isProcessing = processingId === item.id;

    return (
      <View style={styles.invitationCard}>
        <View style={styles.invitationHeader}>
          <View style={styles.iconCircle}>
            <Ionicons name="people" size={20} color={colors.primary} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.groupTitle} numberOfLines={1}>
              {item.groupTitle}
            </Text>
            <Text style={styles.inviterText}>
              Invitado por <Text style={{ color: colors.white, fontWeight: '700' }}>{item.inviterName}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() => handleAction(item.id, false)}
            disabled={isProcessing}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={16} color={colors.debtor} />
            <Text style={styles.rejectBtnText}>Rechazar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => handleAction(item.id, true)}
            disabled={isProcessing}
            activeOpacity={0.85}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark" size={16} color={colors.white} />
                <Text style={styles.acceptBtnText}>Aceptar y Unirme</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.bellBadge}>
                <Ionicons name="notifications" size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.title}>Invitaciones Pendientes</Text>
                <Text style={styles.subtitle}>
                  {invitations.length === 1
                    ? 'Tienes 1 grupo pendiente'
                    : `Tienes ${invitations.length} grupos pendientes`}
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Lista de invitaciones */}
          <FlatList
            data={invitations}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="mail-open-outline" size={44} color={colors.primarySoft} />
                <Text style={styles.emptyTitle}>¡Todo al día!</Text>
                <Text style={styles.emptySub}>No tienes invitaciones pendientes por ahora.</Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 12, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 24,
    width: '100%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: colors.cardBorderGlow,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.cardSecondary,
    borderWidth: 1,
    borderColor: colors.cardBorderGlow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: colors.backgroundSecondary,
  },
  listContainer: {
    padding: 16,
  },
  invitationCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  invitationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  headerInfo: {
    flex: 1,
  },
  groupTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  inviterText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.debtorSoft,
    borderWidth: 1,
    borderColor: colors.debtor,
    gap: 6,
  },
  rejectBtnText: {
    color: colors.debtor,
    fontSize: 13,
    fontWeight: '700',
  },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.primary,
    gap: 6,
  },
  acceptBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    gap: 8,
  },
  emptyTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  emptySub: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
});
