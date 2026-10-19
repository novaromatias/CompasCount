import { colors } from '../theme/colors';

export interface ExpenseCategoryMeta {
  icon: string;
  bg: string;
  color: string;
  label: string;
}

export function getExpenseCategoryMeta(title: string): ExpenseCategoryMeta {
  const t = (title || '').toLowerCase();

  // Comida / Gastronomía
  if (
    t.includes('pizza') ||
    t.includes('burger') ||
    t.includes('hamburguesa') ||
    t.includes('asado') ||
    t.includes('carne') ||
    t.includes('cena') ||
    t.includes('almuerzo') ||
    t.includes('comida') ||
    t.includes('sushi') ||
    t.includes('empanada') ||
    t.includes('factura') ||
    t.includes('helado')
  ) {
    return {
      icon: 'restaurant',
      bg: 'rgba(189, 0, 255, 0.15)',
      color: colors.primarySoft,
      label: 'Comida',
    };
  }

  // Bebidas / Bar
  if (
    t.includes('cerveza') ||
    t.includes('birra') ||
    t.includes('fernet') ||
    t.includes('vino') ||
    t.includes('trago') ||
    t.includes('boliche') ||
    t.includes('bar') ||
    t.includes('fiesta')
  ) {
    return {
      icon: 'beer',
      bg: 'rgba(255, 77, 109, 0.15)',
      color: colors.debtor,
      label: 'Bebidas',
    };
  }

  // Supermercado / Compras
  if (
    t.includes('super') ||
    t.includes('mercado') ||
    t.includes('coto') ||
    t.includes('carrefour') ||
    t.includes('dia') ||
    t.includes('verduleria') ||
    t.includes('compras') ||
    t.includes('almacen')
  ) {
    return {
      icon: 'cart',
      bg: 'rgba(41, 204, 136, 0.15)',
      color: colors.creditor,
      label: 'Super',
    };
  }

  // Transporte / Viaje
  if (
    t.includes('nafta') ||
    t.includes('combustible') ||
    t.includes('peaje') ||
    t.includes('uber') ||
    t.includes('cabify') ||
    t.includes('taxi') ||
    t.includes('pasaje') ||
    t.includes('vuelo') ||
    t.includes('avion')
  ) {
    return {
      icon: 'car',
      bg: 'rgba(6, 182, 212, 0.15)',
      color: '#06B6D4',
      label: 'Viaje',
    };
  }

  // Alojamiento
  if (
    t.includes('hotel') ||
    t.includes('airbnb') ||
    t.includes('hostel') ||
    t.includes('cabaña') ||
    t.includes('alquiler')
  ) {
    return {
      icon: 'bed',
      bg: 'rgba(189, 0, 255, 0.2)',
      color: colors.primary,
      label: 'Hospedaje',
    };
  }

  // Default: Recibo / Gasto
  return {
    icon: 'receipt',
    bg: colors.cardSecondary,
    color: colors.primarySoft,
    label: 'Gasto',
  };
}
