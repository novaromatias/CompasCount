import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { colors } from '../theme/colors';
import { createGroup } from '../services/storage';
import { Header } from '../components/Header';
import { Avatar } from '../components/Avatar';
import { Ionicons } from '@expo/vector-icons';

interface CreateGroupScreenProps {
  navigation: any;
}

export const CreateGroupScreen: React.FC<CreateGroupScreenProps> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [participants, setParticipants] = useState<string[]>(['Yo']);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addParticipant = () => {
    if (!newParticipantName.trim()) return;
    if (participants.includes(newParticipantName.trim())) {
      setError('Ya existe un participante con ese nombre');
      return;
    }
    setParticipants([...participants, newParticipantName.trim()]);
    setNewParticipantName('');
    setError(null);
  };

  const removeParticipant = (index: number) => {
    if (participants.length <= 1) {
      setError('Debe haber al menos un participante');
      return;
    }
    setParticipants(participants.filter((_, i) => i !== index));
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
      const newGroup = await createGroup(title.trim(), description.trim(), participants);
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

        {/* Participantes */}
        <View style={styles.card}>
          <View style={styles.participantsHeaderRow}>
            <Text style={styles.sectionHeader}>Participantes ({participants.length})</Text>
            <Text style={styles.minRequired}>Mínimo 2</Text>
          </View>
          <Text style={styles.hintSub}>
            Agrega los nombres de los amigos que compartirán las cuentas.
          </Text>

          {/* Input para nuevo amigo */}
          <View style={styles.addParticipantRow}>
            <TextInput
              style={styles.participantInput}
              value={newParticipantName}
              onChangeText={(t) => {
                setNewParticipantName(t);
                setError(null);
              }}
              placeholder="Nombre del amigo (ej: Lucas, Ana, Sofi)"
              placeholderTextColor={colors.textMuted}
              onSubmitEditing={addParticipant}
            />
            <TouchableOpacity style={styles.addBtn} onPress={addParticipant} activeOpacity={0.8}>
              <Ionicons name="add" size={22} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Chips de amigos */}
          <View style={styles.chipsWrap}>
            {participants.map((name, index) => (
              <View key={index} style={styles.participantChip}>
                <Avatar name={name} size="sm" />
                <Text style={styles.chipText}>{name}</Text>
                <TouchableOpacity onPress={() => removeParticipant(index)} style={styles.removeChipBtn}>
                  <Ionicons name="close" size={15} color={colors.textMuted} />
                </TouchableOpacity>
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

        {/* Botón Crear */}
        <TouchableOpacity
          style={[styles.createBtn, loading && styles.btnDisabled]}
          onPress={handleCreate}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-done" size={20} color={colors.white} style={{ marginRight: 8 }} />
          <Text style={styles.createBtnText}>
            {loading ? 'Creando grupo...' : 'Crear Grupo'}
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
  },
  addParticipantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  participantInput: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    color: colors.white,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  addBtn: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
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
    gap: 6,
  },
  chipText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
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
