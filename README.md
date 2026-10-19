# 💜 CompasCount

> App móvil multiplataforma para dividir gastos con amigos idéntica a Tricount, con soporte **Offline-First**, integración con **Supabase**, algoritmo de deudas mínimas (*Minimum Cash Flow*) y una estética moderna en **modo oscuro permanente** (`#bd00ff` / `#f1c9ff`).

---

## 🚀 Características Principales

- **Acceso Híbrido**: Úsala inmediatamente como **Invitado** sin registro obligatorio o conecta tu cuenta de Google.
- **100% Offline-First**: Carga gastos, pagos y grupos sin señal de internet; se sincronizan automáticamente con resolución *Last-Write-Wins* por timestamp de carga.
- **Carga Flexible de Gastos**:
  - Múltiples pagadores en un mismo concepto con validación de suma.
  - Reparto equitativo (por partes iguales seleccionando amigos participantes).
  - Reparto por importes exactos.
- **Edición Completa de Conceptos**:
  - Modifica el nombre, monto, pagadores y participantes de cualquier gasto ya cargado.
  - Opción de eliminar concepto con confirmación.
- **Algoritmo de Liquidación Inteligente (*Minimum Cash Flow*)**:
  - Calcula el saldo neto de cada amigo (verde para saldos a favor, rojo para deudas).
  - Genera las **Sugerencias de Pagos** minimizando al menor número de transferencias bancarias posibles.
  - Recálculo dinámico automático tras cada nuevo gasto o pago.
- **Flujo de Pagos Ágil**:
  - Botón **"Pagar"** en cada sugerencia con monto pre-cargado editable.
  - Botón general **"Registrar Pago"** manual entre cualquier par de personas.
- **Tema Oscuro Neón Púrpura**:
  - Paleta: `#09070F` (fondo profundo), `#161126` (tarjetas), `#BD00FF` (neón púrpura) y `#F1C9FF` (lila pastel).

---

## 🛠️ Tecnologías

- **Framework**: React Native + [Expo SDK 52](https://expo.dev)
- **Lenguaje**: TypeScript
- **Navegación**: React Navigation (Native Stack)
- **Persistencia Local**: `@react-native-async-storage/async-storage`
- **Backend & Nube**: [Supabase](https://supabase.com) (PostgreSQL, RLS y Realtime)
- **Plataformas**: Android (Android 8.0+ / API 26+), iOS y Web

---

## 📦 Instalación y Ejecución Local

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/novaromatias/CompasCount.git
   cd CompasCount
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Iniciar servidor de desarrollo**:
   ```bash
   npx expo start
   ```

4. **Ejecutar en tu dispositivo**:
   - **En Android**: Escanea el código QR desde la app oficial **Expo Go**.
   - **En Emulador Android**: Presiona `a` en la terminal o corre `npm run android`.
   - **En Web**: Presiona `w` en la terminal o corre `npm run web`.

---

## 🗄️ Base de Datos (Supabase)

El script SQL completo con todas las tablas, índices y políticas de Row Level Security (RLS) se encuentra en:
```
supabase/schema.sql
```

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
