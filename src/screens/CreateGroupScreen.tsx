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
      <Header title="Nuevo CompasCount" showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Info del Grupo */}
        <View style={styles.card}>
          <Text style={styles.label}>Título del grupo / evento *</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={(t) => {
              setTitle(t);
              setError(null);
            }}
            placeholder="Ej: Viaje a la Costa, Asado amigos..."
            placeholderTextColor={colors.textMuted}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Descripción o lugar (opcional)</Text>
          <TextInput
            style={styles.textInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Ej: Vacaciones de verano"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Participantes */}
        <View style={styles.card}>
          <Text style={styles.label}>Participantes ({participants.length})</Text>
          <Text style={styles.hintSub}>
            Agrega los nombres de las personas que compartirán los gastos.
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
              placeholder="Nombre del amigo (ej: Lucas, Ana)"
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
                <Ionicons name="person-circle" size={18} color={colors.primarySoft} />
                <Text style={styles.chipText}>{name}</Text>
                <TouchableOpacity onPress={() => removeParticipant(index)} style={styles.removeChipBtn}>
                  <Ionicons name="close" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Botón Crear */}
        <TouchableOpacity
          style={[styles.createBtn, loading && styles.btnDisabled]}
          onPress={handleCreate}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Ionicons name="rocket-outline" size={20} color={colors.white} style={{ marginRight: 8 }} />
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
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  hintSub: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 12,
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
    paddingVertical: 10,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    padding: 2,
    marginLeft: 2,
  },
  errorText: {
    color: colors.debtor,
    fontSize: 13,
    marginBottom: 14,
    textAlign: 'center',
  },
  createBtn: {
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
  createBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
