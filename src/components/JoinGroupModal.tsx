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
import { TricountGroup, Participant, UserProfile } from '../types';
import { Avatar } from './Avatar';
import { claimParticipant } from '../services/invitationService';
import { Ionicons } from '@expo/vector-icons';

interface JoinGroupModalProps {
  visible: boolean;
  group: TricountGroup | null;
  currentUser: UserProfile | null;
  onClose: () => void;
  onJoined: () => void;
}

export const JoinGroupModal: React.FC<JoinGroupModalProps> = ({
  visible,
  group,
  currentUser,
  onClose,
  onJoined,
}) => {
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!group) return null;

  // Participantes libres (que aún no tienen un userId vinculado)
  const freeParticipants = group.participants.filter((p) => !p.userId);
  const allClaimed = freeParticipants.length === 0;

  const handleClaim = async () => {
    if (!selectedPartId) {
      setError('Por favor selecciona quién eres en la lista');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const effectiveUser: UserProfile = currentUser || {
        id: `guest-${Date.now()}`,
        name: 'Invitado',
        isGuest: true,
      };

      const ok = await claimParticipant(group.id, selectedPartId, effectiveUser);
      if (ok) {
        onJoined();
        onClose();
      } else {
        setError('No se pudo vincular este participante');
      }
    } catch (err: any) {
      setError(err?.message || 'Error al unirse al grupo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerIcon}>
              <Ionicons name="link" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>
                {group.title}
              </Text>
              <Text style={styles.subtitle}>Enlace de invitación recibido</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {allClaimed ? (
            /* Advertencia si todos tienen login / están reclamados */
            <View style={styles.warningContainer}>
              <View style={styles.warningIconCircle}>
                <Ionicons name="lock-closed" size={32} color={colors.debtor} />
              </View>
              <Text style={styles.warningTitle}>Grupo sin cupos disponibles</Text>
              <Text style={styles.warningText}>
                Todos los participantes de este grupo ya tienen una cuenta vinculada.
                {'\n\n'}
                Si formas parte de este grupo y aún no estás en la lista, pídele al administrador que
                agregue tu nombre antes de ingresar.
              </Text>

              <TouchableOpacity style={styles.warningCloseBtn} onPress={onClose} activeOpacity={0.85}>
                <Text style={styles.warningCloseBtnText}>Entendido</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Lista para seleccionar quién es */
            <View style={styles.body}>
              <Text style={styles.promptTitle}>¿Quién eres tú en este grupo?</Text>
              <Text style={styles.promptSubtitle}>
                Selecciona tu nombre para vincular tus gastos y ver tu saldo.
                {currentUser && !currentUser.isGuest
                  ? ` Quedará enlazado a tu cuenta de Google (${currentUser.email}).`
                  : ' Puedes ingresar como invitado o iniciar sesión más tarde.'}
              </Text>

              <FlatList
                data={freeParticipants}
                keyExtractor={(item) => item.id}
                style={styles.partList}
                renderItem={({ item }) => {
                  const isSelected = selectedPartId === item.id;
                  return (
                    <TouchableOpacity
                      style={[styles.partItem, isSelected && styles.partItemSelected]}
                      onPress={() => {
                        setSelectedPartId(item.id);
                        setError(null);
                      }}
                      activeOpacity={0.75}
                    >
                      <Avatar name={item.name} size="md" />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.partName, isSelected && styles.partNameSelected]}>
                          {item.name}
                        </Text>
                        <Text style={styles.partStatus}>Disponible para reclamar</Text>
                      </View>
                      <View
                        style={[
                          styles.radioCircle,
                          isSelected && styles.radioCircleSelected,
                        ]}
                      >
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />

              {error && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color={colors.debtor} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.confirmBtn, (!selectedPartId || loading) && styles.btnDisabled]}
                onPress={handleClaim}
                disabled={!selectedPartId || loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={18} color={colors.white} style={{ marginRight: 6 }} />
                    <Text style={styles.confirmBtnText}>Confirmar y Entrar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
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
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: colors.cardBorderGlow,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    gap: 12,
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.cardSecondary,
    borderWidth: 1,
    borderColor: colors.cardBorderGlow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: colors.white,
    fontSize: 16,
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
  body: {
    padding: 20,
  },
  promptTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  promptSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  partList: {
    maxHeight: 220,
    marginBottom: 16,
  },
  partItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 12,
  },
  partItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.cardSecondary,
  },
  partName: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  partNameSelected: {
    color: colors.primarySoft,
  },
  partStatus: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.debtorSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 14,
    gap: 8,
  },
  errorText: {
    color: colors.debtor,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
  },
  confirmBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  warningContainer: {
    padding: 24,
    alignItems: 'center',
  },
  warningIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.debtorSoft,
    borderWidth: 1,
    borderColor: colors.debtor,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  warningTitle: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  warningText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  warningCloseBtn: {
    backgroundColor: colors.cardSecondary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorderGlow,
  },
  warningCloseBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
