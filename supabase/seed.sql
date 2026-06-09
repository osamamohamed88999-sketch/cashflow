-- ============================================================
-- DIGI WHALE MONEY CONTROL — Seed Data
-- Run this AFTER migration.sql and AFTER registering your user
-- Replace 'YOUR_USER_ID' with your actual auth user UUID
-- ============================================================

-- You can find your user ID by running:
-- SELECT id FROM auth.users LIMIT 1;

-- Then replace all occurrences of YOUR_USER_ID below.

DO $$
DECLARE
  v_user_id UUID;
  v_bank_id UUID;
  v_cash_id UUID;
  v_wallet_id UUID;
  v_biz_id UUID;
  -- category IDs
  c_salary UUID;
  c_bonus UUID;
  c_refund UUID;
  c_other_income UUID;
  c_rent UUID;
  c_personal UUID;
  c_food UUID;
  c_transport UUID;
  c_shopping UUID;
  c_installments UUID;
  c_furniture UUID;
  c_gameya UUID;
  c_family UUID;
  c_emergency UUID;
  c_other_expense UUID;
  c_client_payment UUID;
  c_automation UUID;
  c_retainer UUID;
  c_consultation UUID;
  c_other_biz_income UUID;
  c_freelancer UUID;
  c_emp_salary UUID;
  c_sales_commission UUID;
  c_ads UUID;
  c_software UUID;
  c_subscriptions UUID;
  c_hosting UUID;
  c_operations UUID;
  c_content UUID;
  c_other_biz_expense UUID;
BEGIN
  -- Get the first user (you)
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found. Please register first, then run this seed.';
  END IF;

  -- ============================================================
  -- ACCOUNTS
  -- ============================================================
  v_bank_id := uuid_generate_v4();
  v_cash_id := uuid_generate_v4();
  v_wallet_id := uuid_generate_v4();
  v_biz_id := uuid_generate_v4();

  INSERT INTO accounts (id, user_id, name, type, opening_balance, notes) VALUES
    (v_bank_id, v_user_id, 'الحساب البنكي الشخصي', 'bank', 250000, 'الحساب البنكي الرئيسي'),
    (v_cash_id, v_user_id, 'الكاش', 'cash', 0, 'النقد المتاح'),
    (v_wallet_id, v_user_id, 'فودافون كاش', 'wallet', 0, 'محفظة فودافون كاش'),
    (v_biz_id, v_user_id, 'حساب Digi Whale', 'business', 0, 'حساب الشركة');

  -- ============================================================
  -- PERSONAL INCOME CATEGORIES
  -- ============================================================
  c_salary := uuid_generate_v4();
  c_bonus := uuid_generate_v4();
  c_refund := uuid_generate_v4();
  c_other_income := uuid_generate_v4();

  INSERT INTO categories (id, user_id, name, type, bucket, icon, is_default) VALUES
    (c_salary, v_user_id, 'مرتب', 'income', 'personal', '💰', TRUE),
    (c_bonus, v_user_id, 'مكافأة', 'income', 'personal', '🎁', TRUE),
    (c_refund, v_user_id, 'استرداد', 'income', 'personal', '↩️', TRUE),
    (c_other_income, v_user_id, 'دخل آخر', 'income', 'personal', '💵', TRUE);

  -- ============================================================
  -- PERSONAL EXPENSE CATEGORIES
  -- ============================================================
  c_rent := uuid_generate_v4();
  c_personal := uuid_generate_v4();
  c_food := uuid_generate_v4();
  c_transport := uuid_generate_v4();
  c_shopping := uuid_generate_v4();
  c_installments := uuid_generate_v4();
  c_furniture := uuid_generate_v4();
  c_gameya := uuid_generate_v4();
  c_family := uuid_generate_v4();
  c_emergency := uuid_generate_v4();
  c_other_expense := uuid_generate_v4();

  INSERT INTO categories (id, user_id, name, type, bucket, icon, is_default) VALUES
    (c_rent, v_user_id, 'إيجار', 'expense', 'personal', '🏠', TRUE),
    (c_personal, v_user_id, 'مصروف شخصي', 'expense', 'personal', '🧑', TRUE),
    (c_food, v_user_id, 'أكل', 'expense', 'personal', '🍔', TRUE),
    (c_transport, v_user_id, 'مواصلات', 'expense', 'personal', '🚗', TRUE),
    (c_shopping, v_user_id, 'تسوق', 'expense', 'personal', '🛒', TRUE),
    (c_installments, v_user_id, 'أقساط', 'expense', 'personal', '📋', TRUE),
    (c_furniture, v_user_id, 'عفشة', 'expense', 'personal', '🪑', TRUE),
    (c_gameya, v_user_id, 'جمعية', 'expense', 'personal', '🤝', TRUE),
    (c_family, v_user_id, 'عائلة', 'expense', 'personal', '👨‍👩‍👧‍👦', TRUE),
    (c_emergency, v_user_id, 'طوارئ', 'expense', 'personal', '🚨', TRUE),
    (c_other_expense, v_user_id, 'مصاريف أخرى', 'expense', 'personal', '📦', TRUE);

  -- ============================================================
  -- DIGI WHALE INCOME CATEGORIES
  -- ============================================================
  c_client_payment := uuid_generate_v4();
  c_automation := uuid_generate_v4();
  c_retainer := uuid_generate_v4();
  c_consultation := uuid_generate_v4();
  c_other_biz_income := uuid_generate_v4();

  INSERT INTO categories (id, user_id, name, type, bucket, icon, is_default) VALUES
    (c_client_payment, v_user_id, 'دفعة عميل', 'income', 'digi_whale', '💳', TRUE),
    (c_automation, v_user_id, 'مشروع أتمتة', 'income', 'digi_whale', '🤖', TRUE),
    (c_retainer, v_user_id, 'عقد شهري', 'income', 'digi_whale', '📄', TRUE),
    (c_consultation, v_user_id, 'استشارة', 'income', 'digi_whale', '🧠', TRUE),
    (c_other_biz_income, v_user_id, 'دخل عمل آخر', 'income', 'digi_whale', '💼', TRUE);

  -- ============================================================
  -- DIGI WHALE EXPENSE CATEGORIES
  -- ============================================================
  c_freelancer := uuid_generate_v4();
  c_emp_salary := uuid_generate_v4();
  c_sales_commission := uuid_generate_v4();
  c_ads := uuid_generate_v4();
  c_software := uuid_generate_v4();
  c_subscriptions := uuid_generate_v4();
  c_hosting := uuid_generate_v4();
  c_operations := uuid_generate_v4();
  c_content := uuid_generate_v4();
  c_other_biz_expense := uuid_generate_v4();

  INSERT INTO categories (id, user_id, name, type, bucket, icon, is_default) VALUES
    (c_freelancer, v_user_id, 'دفعة فريلانسر', 'expense', 'digi_whale', '👨‍💻', TRUE),
    (c_emp_salary, v_user_id, 'مرتب موظف', 'expense', 'digi_whale', '👔', TRUE),
    (c_sales_commission, v_user_id, 'عمولة مبيعات', 'expense', 'digi_whale', '📊', TRUE),
    (c_ads, v_user_id, 'إعلانات', 'expense', 'digi_whale', '📢', TRUE),
    (c_software, v_user_id, 'أدوات برمجية', 'expense', 'digi_whale', '🛠️', TRUE),
    (c_subscriptions, v_user_id, 'اشتراكات', 'expense', 'digi_whale', '🔄', TRUE),
    (c_hosting, v_user_id, 'استضافة', 'expense', 'digi_whale', '🌐', TRUE),
    (c_operations, v_user_id, 'عمليات', 'expense', 'digi_whale', '⚙️', TRUE),
    (c_content, v_user_id, 'صناعة محتوى', 'expense', 'digi_whale', '🎬', TRUE),
    (c_other_biz_expense, v_user_id, 'مصاريف عمل أخرى', 'expense', 'digi_whale', '📁', TRUE);

  -- ============================================================
  -- PEOPLE (Hoda)
  -- ============================================================
  INSERT INTO people (user_id, name, type, role, monthly_salary, notes, is_active) VALUES
    (v_user_id, 'هدى', 'sales', 'مسؤولة مبيعات', 5000, 'مرتب شهري 5000 جنيه', TRUE);

  -- ============================================================
  -- MONTHLY COMMITMENTS
  -- ============================================================
  INSERT INTO monthly_commitments (user_id, name, amount, category_id, account_id, due_day, bucket, commitment_type) VALUES
    (v_user_id, 'مرتب هدى', 5000, c_emp_salary, v_biz_id, 1, 'digi_whale', 'fixed'),
    (v_user_id, 'جمعية', 10000, c_gameya, v_bank_id, 1, 'personal', 'fixed'),
    (v_user_id, 'قسط العفشة', 10000, c_furniture, v_bank_id, 5, 'personal', 'temporary'),
    (v_user_id, 'إيجار', 4650, c_rent, v_bank_id, 1, 'personal', 'fixed'),
    (v_user_id, 'مصروف شخصي', 3500, c_personal, v_bank_id, 1, 'personal', 'fixed');

  -- ============================================================
  -- MONTHLY TARGETS (Current Month)
  -- ============================================================
  INSERT INTO monthly_targets (user_id, month, category_id, name, target_type, target_amount, bucket) VALUES
    (v_user_id, DATE_TRUNC('month', CURRENT_DATE), c_personal, 'حد المصروف الشخصي', 'spending_limit', 3500, 'personal'),
    (v_user_id, DATE_TRUNC('month', CURRENT_DATE), c_furniture, 'قسط العفشة', 'required_payment', 10000, 'personal');

  -- ============================================================
  -- SETTINGS
  -- ============================================================
  INSERT INTO settings (user_id, default_account_id, month_start_day, show_digi_whale) VALUES
    (v_user_id, v_bank_id, 1, TRUE);

END $$;
