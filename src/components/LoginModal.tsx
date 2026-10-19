import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  Image,
} from 'react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ visible, onClose }) => {
  const { user, isGuest, loginWithGoogleMock, logout } = useAuth();
  const [customName, setCustomName] = useState('Matias Novaro');
  const [customEmail, setCustomEmail] = useState('matias.novaro@gmail.com');
  const [showCustomFields, setShowCustomFields] = useState(false);

  const handleGoogleLogin = async () => {
    await loginWithGoogleMock(customName.trim() || 'Usuario Google', customEmail.trim() || 'usuario@gmail.com');
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              <View style={styles.header}>
                <View style={styles.titleRow}>
                  <Ionicons name="person-circle-outline" size={26} color={colors.primary} />
                  <Text style={styles.title}>
                    {isGuest ? 'Iniciar Sesión' : 'Tu Cuenta'}
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={22} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {!isGuest && user ? (
                /* Usuario Conectado */
                <View style={styles.connectedContainer}>
                  <View style={styles.avatarCircle}>
                    <Ionicons name="person" size={32} color={colors.primary} />
                  </View>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>

                  <View style={styles.googleConnectedBadge}>
                    <Ionicons name="logo-google" size={14} color="#4285F4" />
                    <Text style={styles.googleConnectedText}>Conectado con Google (Simulación Local)</Text>
                  </View>

                  <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                    <Ionicons name="log-out-outline" size={18} color={colors.debtor} style={{ marginRight: 6 }} />
                    <Text style={styles.logoutBtnText}>Cerrar Sesión (Volver a Invitado)</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* Modo Invitado - Opciones de Inicio de Sesión */
                <View style={styles.loginContainer}>
                  <Text style={styles.subtitle}>
                    Inicia sesión para sincronizar tus grupos de CompasCount y guardar tus balances.
                  </Text>

                  {/* Botón Estilo Google */}
                  <TouchableOpacity
                    style={styles.googleButton}
                    onPress={handleGoogleLogin}
                    activeOpacity={0.85}
                  >
                    <View style={styles.googleIconWrapper}>
                      <Ionicons name="logo-google" size={20} color="#EA4335" />
                    </View>
                    <Text style={styles.googleButtonText}>Continuar con Google</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.toggleCustomBtn}
                    onPress={() => setShowCustomFields(!showCustomFields)}
                  >
                    <Text style={styles.toggleCustomText}>
                      {showCustomFields ? 'Ocultar opciones de prueba' : 'Personalizar nombre/correo de prueba'}
                    </Text>
                  </TouchableOpacity>

                  {showCustomFields && (
                    <View style={styles.customBox}>
                      <Text style={styles.inputLabel}>Nombre simulado:</Text>
                      <TextInput
                        style={styles.input}
                        value={customName}
                        onChangeText={setCustomName}
                        placeholderTextColor={colors.textMuted}
                      />
                      <Text style={[styles.inputLabel, { marginTop: 8 }]}>Email simulado:</Text>
                      <TextInput
                        style={styles.input}
                        value={customEmail}
                        onChangeText={setCustomEmail}
                        placeholderTextColor={colors.textMuted}
                        keyboardType="email-address"
                      />
                    </View>
                  )}

                  <View style={styles.noticeBox}>
                    <Ionicons name="shield-checkmark-outline" size={16} color={colors.creditor} style={{ marginRight: 6 }} />
                    <Text style={styles.noticeText}>
                      Modo local activo: No se envían datos a ningún servidor externo.
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 3, 10, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 22,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
  },
  loginContainer: {
    alignItems: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 24,
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  googleIconWrapper: {
    marginRight: 10,
  },
  googleButtonText: {
    color: '#3c4043',
    fontSize: 15,
    fontWeight: '600',
  },
  toggleCustomBtn: {
    marginTop: 14,
    padding: 6,
  },
  toggleCustomText: {
    color: colors.primarySoft,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  customBox: {
    width: '100%',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  inputLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    color: colors.white,
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(41, 204, 136, 0.1)',
    borderRadius: 12,
    padding: 10,
    marginTop: 18,
    borderWidth: 1,
    borderColor: 'rgba(41, 204, 136, 0.3)',
    width: '100%',
  },
  noticeText: {
    color: colors.creditor,
    fontSize: 11,
    flex: 1,
  },
  connectedContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.cardSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: 12,
  },
  userName: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  userEmail: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 12,
  },
  googleConnectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 6,
    marginBottom: 20,
  },
  googleConnectedText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 77, 109, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 109, 0.3)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    width: '100%',
  },
  logoutBtnText: {
    color: colors.debtor,
    fontSize: 13,
    fontWeight: '600',
  },
});
