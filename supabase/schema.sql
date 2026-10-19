-- Esquema para Supabase - CompasCount (Tricount Clone)

-- 1. Tabla de Grupos (CompasCounts)
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    currency_symbol TEXT DEFAULT '$',
    share_code TEXT UNIQUE NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Participantes (Amigos en el grupo)
CREATE TABLE IF NOT EXISTS public.participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Gastos / Conceptos
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount > 0),
    split_type TEXT NOT NULL DEFAULT 'EQUAL', -- 'EQUAL' o 'EXACT'
    expense_date TIMESTAMPTZ DEFAULT NOW(),
    created_offline_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Pagadores del Gasto (1 o más pagadores por gasto)
CREATE TABLE IF NOT EXISTS public.expense_payers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0)
);

-- 5. Reparto de Gastos (Participantes del concepto y cuánto debe cada uno)
CREATE TABLE IF NOT EXISTS public.expense_splits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    percentage NUMERIC(5, 2) DEFAULT NULL
);

-- 6. Tabla de Pagos / Devoluciones (Saldar cuentas)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    from_participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    to_participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    note TEXT DEFAULT '',
    created_offline_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimizar consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_participants_group ON public.participants(group_id);
CREATE INDEX IF NOT EXISTS idx_expenses_group ON public.expenses(group_id);
CREATE INDEX IF NOT EXISTS idx_expense_payers_expense ON public.expense_payers(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_expense ON public.expense_splits(expense_id);
CREATE INDEX IF NOT EXISTS idx_payments_group ON public.payments(group_id);
CREATE INDEX IF NOT EXISTS idx_groups_share_code ON public.groups(share_code);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_payers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS públicas y permisivas para soportar invitados con share_code y usuarios autenticados
CREATE POLICY "Acceso total a grupos" ON public.groups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a participantes" ON public.participants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a gastos" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a pagadores" ON public.expense_payers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a repartos" ON public.expense_splits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a pagos" ON public.payments FOR ALL USING (true) WITH CHECK (true);
