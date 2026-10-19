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
  ActivityIndicator,
} from 'react-native';
import { colors } from '../theme/colors';
import { createGroup } from '../services/storage';
import { Header } from '../components/Header';
import { Avatar } from '../components/Avatar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { checkUserExistsByEmail, createAndSendInvitations } from '../services/invitationService';

interface CreateGroupScreenProps {
  navigation: any;
}

interface ParticipantItem {
  id: string;
  name: string;
  email?: string;
  isRegistered?: boolean;
}

export const CreateGroupScreen: React.FC<CreateGroupScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Participantes iniciales: el creador siempre primero
  const [participants, setParticipants] = useState<ParticipantItem[]>([
    {
      id: 'creator',
      name: user?.name ? `${user.name.split(' ')[0]} (Tú)` : 'Yo',
      email: user?.email,
      isRegistered: !user?.isGuest,
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailCheckResult, setEmailCheckResult] = useState<{
    isEmail: boolean;
    isRegistered: boolean;
    registeredName?: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteFeedback, setInviteFeedback] = useState<string | null>(null);

  // Detección automática al tipear email
  useEffect(() => {
    const trimmed = inputVal.trim();
    const isEmailFormat = trimmed.includes('@') && trimmed.includes('.');

    if (!isEmailFormat) {
      setEmailCheckResult(null);
      setIsVerifying(false);
      return;
    }

    let active = true;
    setIsVerifying(true);

    const timer = setTimeout(async () => {
      const res = await checkUserExistsByEmail(trimmed);
      if (active) {
        setEmailCheckResult({
          isEmail: true,
          isRegistered: res.exists,
          registeredName: res.user?.name,
        });
        setIsVerifying(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [inputVal]);

  const addParticipant = () => {
    const trimmed = inputVal.trim();
    if (!trimmed) return;

    const isEmail = trimmed.includes('@') && trimmed.includes('.');

    // Validar duplicados
    const exists = participants.some(
      (p) =>
        p.name.toLowerCase() === trimmed.toLowerCase() ||
        (p.email && p.email.toLowerCase() === trimmed.toLowerCase())
    );

    if (exists) {
      setError('Ese participante o correo ya está en la lista');
      return;
    }

    if (isEmail) {
      const isReg = emailCheckResult?.isRegistered || false;
      const displayName = emailCheckResult?.registeredName || trimmed.split('@')[0];

      setParticipants([
        ...participants,
        {
          id: `p-${Date.now()}`,
          name: displayName,
          email: trimmed,
          isRegistered: isReg,
        },
      ]);
    } else {
      setParticipants([
        ...participants,
        {
          id: `p-${Date.now()}`,
          name: trimmed,
          isRegistered: false,
        },
      ]);
    }

    setInputVal('');
    setEmailCheckResult(null);
    setError(null);
  };

  const removeParticipant = (id: string) => {
    if (participants.length <= 1) {
      setError('Debe haber al menos un participante');
      return;
    }
    setParticipants(participants.filter((p) => p.id !== id));
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      setError('Por favor escribe un título para el grupo');
      return;
    }
    if (participants.length < 2) {
      setError('Agrega al menos 2 participantes para poder dividir gastos');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Guardar grupo con participantes
      const participantPayload = participants.map((p, idx) => ({
        name: p.name,
        email: p.email,
        userId: idx === 0 && !user?.isGuest ? user?.id : undefined,
      }));

      const newGroup = await createGroup(title.trim(), description.trim(), participantPayload);

      // 2. Despachar invitaciones por correo o push a los participantes que tienen email
      const inviteesWithEmail = participants
        .filter((p) => !!p.email && p.id !== 'creator')
        .map((p) => ({ name: p.name, email: p.email! }));

      if (inviteesWithEmail.length > 0 && user) {
        setInviteFeedback('Despachando notificaciones e invitaciones...');
        await createAndSendInvitations(newGroup, user, inviteesWithEmail);
      }

      navigation.replace('GroupDetail', { groupId: newGroup.id, title: newGroup.title });
    } catch (err: any) {
      setError(err?.message || 'Error al crear el grupo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <Header title="Nuevo Grupo" showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Info del Grupo */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Información del grupo</Text>

          <Text style={styles.label}>Nombre del grupo o evento *</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={(t) => {
              setTitle(t);
              setError(null);
            }}
            placeholder="Ej: Viaje a la Costa, Asado del finde, Casa..."
            placeholderTextColor={colors.textMuted}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Descripción o lugar (opcional)</Text>
          <TextInput
            style={styles.textInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Ej: Vacaciones 2026"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Participantes & Invitaciones */}
        <View style={styles.card}>
          <View style={styles.participantsHeaderRow}>
            <Text style={styles.sectionHeader}>Participantes ({participants.length})</Text>
            <Text style={styles.minRequired}>Mínimo 2</Text>
          </View>
          <Text style={styles.hintSub}>
            Escribe un <Text style={{ color: colors.white, fontWeight: '700' }}>nombre</Text> o un{' '}
            <Text style={{ color: colors.primarySoft, fontWeight: '700' }}>email</Text> para invitar
            directamente.
          </Text>

          {/* Input para agregar amigo o email */}
          <View style={styles.addParticipantRow}>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.participantInput}
                value={inputVal}
                onChangeText={(t) => {
                  setInputVal(t);
                  setError(null);
                }}
                placeholder="Nombre o email (ej: lucas@gmail.com)"
                placeholderTextColor={colors.textMuted}
                onSubmitEditing={addParticipant}
                autoCapitalize="none"
              />
              {isVerifying && (
                <View style={styles.verifyingSpinner}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.addBtn} onPress={addParticipant} activeOpacity={0.8}>
              <Ionicons name="add" size={22} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Badge instantáneo de detección de email */}
          {emailCheckResult && (
            <View
              style={[
                styles.badgeStatusBox,
                emailCheckResult.isRegistered ? styles.badgeRegistered : styles.badgeExternal,
              ]}
            >
              <Ionicons
                name={emailCheckResult.isRegistered ? 'checkmark-circle' : 'mail-outline'}
                size={16}
                color={emailCheckResult.isRegistered ? colors.creditor : colors.primarySoft}
              />
              <Text
                style={[
                  styles.badgeStatusText,
                  { color: emailCheckResult.isRegistered ? colors.creditor : colors.primarySoft },
                ]}
              >
                {emailCheckResult.isRegistered
                  ? `Registrado en la app (${emailCheckResult.registeredName}). Recibirá notificación push.`
                  : 'No registrado aún. Se le enviará invitación por correo con link directo.'}
              </Text>
            </View>
          )}

          {/* Chips de amigos */}
          <View style={styles.chipsWrap}>
            {participants.map((item, index) => (
              <View key={item.id} style={styles.participantChip}>
                <Avatar name={item.name} size="sm" />
                <View style={{ flexShrink: 1 }}>
                  <Text style={styles.chipText} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.email && (
                    <View style={styles.chipEmailRow}>
                      <Ionicons
                        name={item.isRegistered ? 'notifications' : 'mail'}
                        size={10}
                        color={item.isRegistered ? colors.creditor : colors.textMuted}
                      />
                      <Text style={styles.chipEmailText} numberOfLines={1}>
                        {item.email}
                      </Text>
                    </View>
                  )}
                </View>
                {index !== 0 && (
                  <TouchableOpacity onPress={() => removeParticipant(item.id)} style={styles.removeChipBtn}>
                    <Ionicons name="close" size={15} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={colors.debtor} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {inviteFeedback && (
          <View style={styles.feedbackBox}>
            <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.feedbackText}>{inviteFeedback}</Text>
          </View>
        )}

        {/* Botón Crear */}
        <TouchableOpacity
          style={[styles.createBtn, loading && styles.btnDisabled]}
          onPress={handleCreate}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-done" size={20} color={colors.white} style={{ marginRight: 8 }} />
          <Text style={styles.createBtnText}>
            {loading ? 'Creando e invitando...' : 'Crear Grupo e Invitar'}
          </Text>
        </TouchableOpacity>
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
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sectionHeader: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  participantsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  minRequired: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
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
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  hintSub: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 14,
    lineHeight: 18,
  },
  addParticipantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  inputWrap: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  participantInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    color: colors.white,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    paddingRight: 36,
  },
  verifyingSpinner: {
    position: 'absolute',
    right: 12,
  },
  addBtn: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 14,
    gap: 8,
    borderWidth: 1,
  },
  badgeRegistered: {
    backgroundColor: colors.creditorSoft,
    borderColor: colors.creditor,
  },
  badgeExternal: {
    backgroundColor: colors.cardSecondary,
    borderColor: colors.primarySoft,
  },
  badgeStatusText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  participantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingLeft: 6,
    paddingRight: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 8,
    maxWidth: '100%',
  },
  chipText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  chipEmailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  chipEmailText: {
    color: colors.textMuted,
    fontSize: 10,
  },
  removeChipBtn: {
    padding: 3,
    marginLeft: 2,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.debtorSoft,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.debtor,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: colors.debtor,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardSecondary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  feedbackText: {
    color: colors.primarySoft,
    fontSize: 13,
    fontWeight: '600',
  },
  createBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 5,
  },
  createBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
