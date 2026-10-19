import { Participant, Expense, Payment, ParticipantBalance, DebtSuggestion } from '../types';

/**
 * Calcula los balances individuales de cada participante y obtiene
 * las sugerencias óptimas de liquidación de deuda usando el algoritmo
 * Greedy de Minimum Cash Flow (simplificación de deudas).
 */
export function calculateGroupFinancials(
  participants: Participant[],
  expenses: Expense[],
  payments: Payment[]
): {
  balances: ParticipantBalance[];
  suggestions: DebtSuggestion[];
  totalGroupSpending: number;
} {
  const map: Record<string, ParticipantBalance> = {};
  let totalGroupSpending = 0;

  for (const p of participants) {
    map[p.id] = {
      participantId: p.id,
      name: p.name,
      totalPaid: 0,
      totalSpent: 0,
      totalSentPayments: 0,
      totalReceivedPayments: 0,
      netBalance: 0,
    };
  }

  // 1. Procesar gastos (pagadores y repartos)
  for (const exp of expenses) {
    totalGroupSpending += exp.totalAmount;
    
    // Lo que cada uno puso de su bolsillo
    for (const payer of exp.payers) {
      if (map[payer.participantId]) {
        map[payer.participantId].totalPaid += payer.amount;
      }
    }

    // Lo que a cada uno le corresponde pagar de ese gasto
    for (const split of exp.splits) {
      if (map[split.participantId]) {
        map[split.participantId].totalSpent += split.amount;
      }
    }
  }

  // 2. Procesar pagos/devoluciones directas entre participantes
  for (const pay of payments) {
    if (map[pay.fromParticipantId]) {
      map[pay.fromParticipantId].totalSentPayments += pay.amount;
    }
    if (map[pay.toParticipantId]) {
      map[pay.toParticipantId].totalReceivedPayments += pay.amount;
    }
  }

  // 3. Saldo neto = (Pagado en gastos + Pagos enviados) - (Consumido en gastos + Pagos recibidos)
  for (const id in map) {
    const p = map[id];
    p.netBalance =
      Math.round(
        (p.totalPaid + p.totalSentPayments - (p.totalSpent + p.totalReceivedPayments)) * 100
      ) / 100;
  }

  const balances = Object.values(map);

  // 4. Algoritmo Greedy de simplificación de deudas (Minimum Cash Flow)
  const debtors: { id: string; name: string; amount: number }[] = [];
  const creditors: { id: string; name: string; amount: number }[] = [];

  for (const b of balances) {
    if (b.netBalance < -0.009) {
      debtors.push({ id: b.participantId, name: b.name, amount: Math.abs(b.netBalance) });
    } else if (b.netBalance > 0.009) {
      creditors.push({ id: b.participantId, name: b.name, amount: b.netBalance });
    }
  }

  const suggestions: DebtSuggestion[] = [];

  while (debtors.length > 0 && creditors.length > 0) {
    // Ordenar de mayor a menor para emparejar el deudor más grande con el acreedor más grande
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const debtor = debtors[0];
    const creditor = creditors[0];

    const settleAmount = Math.min(debtor.amount, creditor.amount);
    const roundedSettle = Math.round(settleAmount * 100) / 100;

    if (roundedSettle > 0) {
      suggestions.push({
        id: `${debtor.id}->${creditor.id}-${roundedSettle}`,
        fromId: debtor.id,
        fromName: debtor.name,
        toId: creditor.id,
        toName: creditor.name,
        amount: roundedSettle,
      });
    }

    debtor.amount = Math.round((debtor.amount - settleAmount) * 100) / 100;
    creditor.amount = Math.round((creditor.amount - settleAmount) * 100) / 100;

    if (debtor.amount <= 0.009) {
      debtors.shift();
    }
    if (creditor.amount <= 0.009) {
      creditors.shift();
    }
  }

  return {
    balances,
    suggestions,
    totalGroupSpending: Math.round(totalGroupSpending * 100) / 100,
  };
}
