---
name: diagnostico
description: >
  Protocolo de diagnóstico deliberado para bugs y problemas técnicos.
  Reconocimiento silencioso del código, entrevista corta basada en hipótesis
  (solo lo que el código no puede responder), confirmación hasta certeza ≥ 90%,
  diagnóstico formal de causa raíz y propuesta de 2-3 soluciones con
  pros/contras. Solo se activa con /diagnostico.
---

# 🔬 Skill: Diagnóstico Deliberado

## Cuándo activar esta skill

**Exclusivamente** cuando el usuario invoca `/diagnostico`. Nunca se autoinvoca.

Usar ante:
- Bugs complejos o intermitentes donde la causa no es obvia
- Problemas que ya se intentaron solucionar sin éxito
- Comportamientos inesperados que requieren análisis profundo
- Situaciones donde el usuario quiere entender el problema antes de actuar

> ⚠️ Este skill es deliberado, NO rápido. Para un fix inmediato, no usarlo.

---

## Protocolo de 6 Fases (Estricto y Secuencial)

Prohibido saltar fases o ejecutar código de modificación antes de la Fase 5.

---

### FASE 0 — Reconocimiento silencioso (máx. 3 lecturas)

**Objetivo:** Entender el flujo real en el código ANTES de hablar con el usuario,
para que las preguntas sean inteligentes y no triviales.

**Reglas:**
1. Sin mensajes al usuario en esta fase. Solo `grep_search` / `view_file`.
2. Máximo 3 operaciones de lectura, dirigidas al flujo mencionado en el pedido.
3. Resultado interno (no se publica completo):
   - Qué acciones, botones, pantallas y funciones EXISTEN realmente en ese flujo.
   - 2-3 hipótesis de causa, ordenadas por probabilidad.
   - Qué información NO se puede obtener del código (datos, estado real, secuencia
     de acciones del usuario).
4. Si el pedido ya es lo bastante claro y las hipótesis se pueden confirmar solo con
   código, se puede saltar directo a la Fase 2 sin entrevista.

**Regla de existencia:** Está PROHIBIDO nombrar en una pregunta un botón, pantalla,
acción o flujo que no se haya encontrado en el código. Si no se encontró, se asume
que no existe y no se pregunta por él.

---

### FASE 1 — Entrevista basada en hipótesis (0 a 5 preguntas)

**Objetivo:** Obtener solo lo que el código no puede decir.

**Filtro previo a CADA pregunta (obligatorio):**
> ¿Podría responderla leyendo el código, el esquema de la base, `recordatorios.md`
> o con una consulta SQL por MCP? → Si sí, NO se pregunta: se verifica.

**Solo se puede preguntar sobre:**
1. **Observación humana:** qué vio u hizo exactamente el usuario (mensaje textual de
   error/toast, secuencia de acciones previas, qué esperaba ver).
2. **Datos concretos** que requieren identificar el registro afectado (ID, número de
   venta, fecha, producto) para consultarlo en la base.
3. **Intención de negocio:** cuál es el comportamiento correcto esperado cuando el
   código admite más de una interpretación.
4. **Entorno/contexto no deducible:** Test o Producción, si ocurrió tras un evento
   externo (corte de internet, balanza desconectada, otro usuario operando).

**Reglas de formato:**
1. Usar la herramienta `ask_question` con opciones de selección. Se pueden agrupar
   2-3 preguntas relacionadas en un solo modal.
2. Cada pregunta debe estar basada en una hipótesis concreta de la Fase 0 y descartar
   al menos una:
   > "El código puede fallar por A (…) o por B (…). ¿Cuál se parece más a lo que viste?"
3. Las opciones deben reflejar lo ya investigado (muestran que no se preguntó a ciegas).
4. **Sin mínimo obligatorio.** Si no hay nada que el código no pueda responder, se
   hacen 0 preguntas. **Máximo 5 en total.**
5. Prohibido repetir lo que el usuario ya dijo en su mensaje.

**Anti-patrones:**
- ❌ "¿En qué pantalla ocurre?" / "¿Qué módulo?" (verificable o ya dicho)
- ❌ "¿Hiciste X?" donde X no existe en el sistema
- ❌ "¿Podés darme más contexto?" (vaga)
- ❌ Preguntas de relleno para llegar a una cantidad
- ❌ Preguntar por versión del navegador, usuarios afectados u otros datos que no
  cambian el diagnóstico
- ✅ Preguntas que descartan una hipótesis concreta o piden un dato que habilita una
  consulta a la base

---

### FASE 2 — Confirmación hasta certeza ≥ 90%

**Objetivo:** Llevar la certeza de la causa raíz a un mínimo del 90%, apuntando al 100%.

**Reglas:**
1. Cada lectura/consulta tiene un propósito claro derivado de una hipótesis.
2. Herramientas permitidas: `grep_search`, `view_file` (solo rango relevante) y
   consultas SQL de solo lectura por MCP (`execute_sql`).
3. Máx. 3 lecturas iniciales. Si con ellas la certeza es < 90%, se permiten hasta
   3 verificaciones adicionales, cada una justificada con la duda concreta que resuelve.
4. **Piso de certeza: 90%.** Está PROHIBIDO pasar a la Fase 3 con menos de 90%.
   Si tras las verificaciones no se alcanza, volver a la Fase 1 con una pregunta
   puntual al usuario, o pedirle una prueba concreta (ver Fase 3).
5. **Certeza de la causa Y de la corrección:** son dos mediciones separadas.
   - Certeza del diagnóstico: ¿estoy seguro de POR QUÉ ocurre?
   - Certeza de la solución: ¿estoy seguro de que el cambio lo resuelve sin efectos
     colaterales? (Verificar llamadores/dependientes de lo que se va a modificar.)

**Escala de referencia:**

| Nivel | Significado |
|---|---|
| 100% | Reproducido o demostrado en código/datos; cadena causal completa sin supuestos |
| 90-99% | Cadena causal completa en código; queda un supuesto menor no verificado |
| < 90% | NO se diagnostica: faltan evidencias, se debe verificar o preguntar |

---

### FASE 3 — Diagnóstico formal

**Formato obligatorio:**

```
## 🔍 Diagnóstico

**Síntoma:** [Lo que el usuario observa]

**Causa raíz:** [Explicación técnica precisa — sin ambigüedades]

**Cadena causal:**
1. [Evento desencadenante]
2. [Qué sucede internamente]
3. [Por qué produce el síntoma]

**Certeza del diagnóstico:** [90%–100%] — [evidencia concreta que la respalda]
**Certeza de la corrección:** [90%–100%] — [por qué el cambio resuelve el problema
y qué se verificó sobre efectos colaterales]

**Qué falta para el 100%:** (obligatorio si alguna certeza es < 100%)
- **Duda concreta:** [qué supuesto no se pudo verificar]
- **Prueba necesaria:** [paso exacto que debe hacer el usuario, o consulta/dato
  que se necesita, para confirmarlo]
- **Cómo cambiaría el diagnóstico:** [qué resultado confirmaría o descartaría la causa]

**Archivo(s) involucrado(s):** [Links clickeables]
```

**Anti-patrones:**
- ❌ Presentar un diagnóstico con certeza < 90% (volver a verificar o preguntar).
- ❌ Declarar 100% sin haber verificado llamadores y datos reales.
- ❌ Poner un porcentaje sin evidencia que lo respalde.
- ❌ "Falta probar" sin indicar qué probar ni cómo.
- ❌ "Podría ser X o Y" sin inclinarse. Elegir la más probable.
- ❌ Confundir síntoma con causa raíz (el valor es null = síntoma; POR QUÉ es null = causa).

---

### FASE 4 — Propuesta de soluciones (mín. 2, máx. 3)

**Formato obligatorio:**

```
## 💡 Soluciones Propuestas

### Solución A: [Nombre descriptivo] ⭐ Recomendada
**Descripción:** [Qué se haría, en 2-3 líneas]
**Archivos a modificar:** [Lista con links]
**Pros:**
- [Pro 1]
**Contras:**
- [Contra 1]
**Cómo validarla:** [Qué probar y qué resultado esperar — obligatorio si la
certeza de la corrección es < 100%]

### Solución B: [Nombre descriptivo]
...

## 🏆 Recomendación
Recomiendo la **Solución [X]** porque [justificación técnica concreta para ESTE caso].
```

**Reglas:**
1. Mínimo 2, máximo 3. Todas genuinamente viables (sin "strawman").
2. Pros/contras específicos al problema (❌ "es más limpio" → ✅ "evita el re-render del padre").
3. Marcar la recomendada con ⭐ y listarla primera.
4. Si la solución toca DB, indicar el impacto en Test/Producción.
5. Si la certeza de la corrección es < 100%, indicar cómo validarla tras aplicarla.

**Cierre:** DETENERSE y preguntar: "¿Cuál solución preferís que implemente?"

---

### FASE 5 — Ejecución tras aprobación

**Reglas:**
1. Solo ejecutar tras aprobación explícita de una solución.
2. Máx. 1 edición por archivo. Prohibidos los micro-parches iterativos.
3. Alcance cerrado: nada de refactors, formateo ni código ajeno.
4. Si falla → STOP, informar y devolver el control. Sin reintentos automáticos.
5. Prohibido ejecutar `npx tsc`, `npm run build` o linters.
6. Explicación post-fix: máximo 3 líneas.

---

## Patrones comunes en CrisolGestión (insumo para la Fase 0)

| Síntoma | Dónde mirar primero |
|---|---|
| Freeze o tilde al interactuar con un input | `useScaleIntegration`, `setWeightLock`, `isWeightLockedRef` |
| Comportamiento que persiste tras cerrar un modal | `cleanup` en el `useEffect` del componente |
| Valor viejo en una acción o cálculo | Referencias desactualizadas en `useCallback` / `useEffect` |
| Dropdown oculto o cortado por el modal | `createPortal`, z-index o clase `fixed` |
| Cálculo de precio/peso incorrecto | Funciones en `/lib/` — redondeo y `number` vs `string` |
| Error de RLS o permiso denegado | Políticas RLS y `auth.tenant_id()` |
| Dato que no se guarda o se pierde | Transacciones/RPC en Supabase — rollback implícito |

---

## Reglas de oro

1. **Primero reconocer, después preguntar.** Las preguntas salen del código, no de un formulario.
2. **Nunca preguntar lo verificable.** Si el sistema puede responderlo, lo verifica.
3. **Nunca nombrar lo que no existe.** Toda acción citada debe estar confirmada en el código.
4. **Cero preguntas es válido.** La cantidad la define la necesidad, no un mínimo.
5. **Nunca confundir síntoma con causa.**
6. **Soluciones genuinas, no relleno.**
7. **Sin reintentos silenciosos.** Si algo falla, avisar y parar.
8. **El usuario decide.** Nunca ejecutar sin aprobación explícita.
9. **Certeza mínima 90%, meta 100%.** Si no se llega al 100%, decir exactamente qué falta
   y qué prueba lo cerraría. Nunca proponer soluciones con certeza < 90%.
