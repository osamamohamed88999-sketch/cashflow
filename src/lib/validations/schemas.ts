import { z } from 'zod';

// ---- Account Schemas ----
export const accountSchema = z.object({
  name: z.string().min(1, 'اسم الحساب مطلوب'),
  type: z.enum(['bank', 'cash', 'wallet', 'business'], { message: 'نوع الحساب مطلوب' }),
  opening_balance: z.number().min(0, 'الرصيد يجب أن يكون 0 أو أكثر'),
  notes: z.string().optional(),
});

export type AccountFormData = z.infer<typeof accountSchema>;

// ---- Transaction Schemas ----
export const transactionSchema = z.object({
  date: z.string().min(1, 'التاريخ مطلوب'),
  type: z.enum(['income', 'expense', 'transfer', 'adjustment'], { message: 'نوع المعاملة مطلوب' }),
  account_id: z.string().min(1, 'اختر الحساب'),
  destination_account_id: z.string().optional().nullable(),
  amount: z.number().positive('المبلغ يجب أن يكون أكبر من صفر'),
  paid_amount: z.number().min(0).optional().nullable(),
  category_id: z.string().optional().nullable(),
  project_id: z.string().optional().nullable(),
  person_id: z.string().optional().nullable(),
  bucket: z.enum(['personal', 'digi_whale']),
  status: z.enum(['paid', 'pending', 'partial']),
  notes: z.string().optional(),
  is_recurring: z.boolean(),
  adjustment_reason: z.string().optional(),
}).refine(
  (data) => {
    if (data.type === 'transfer' && !data.destination_account_id) return false;
    return true;
  },
  { message: 'حساب الوجهة مطلوب للتحويلات', path: ['destination_account_id'] }
).refine(
  (data) => {
    if (data.type === 'adjustment' && !data.adjustment_reason) return false;
    return true;
  },
  { message: 'سبب التسوية مطلوب', path: ['adjustment_reason'] }
);

export type TransactionFormData = z.infer<typeof transactionSchema>;

// ---- Category Schemas ----
export const categorySchema = z.object({
  name: z.string().min(1, 'اسم الفئة مطلوب'),
  type: z.enum(['income', 'expense']),
  bucket: z.enum(['personal', 'digi_whale']),
  icon: z.string().optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

// ---- Commitment Schemas ----
export const commitmentSchema = z.object({
  name: z.string().min(1, 'اسم الالتزام مطلوب'),
  amount: z.number().positive('المبلغ مطلوب'),
  category_id: z.string().optional().nullable(),
  account_id: z.string().optional().nullable(),
  due_day: z.number().min(1).max(28, 'اليوم من 1 إلى 28'),
  bucket: z.enum(['personal', 'digi_whale']),
  commitment_type: z.enum(['fixed', 'temporary']),
  is_active: z.boolean(),
  auto_create: z.boolean(),
  start_month: z.string().optional().nullable(),
  end_month: z.string().optional().nullable(),
  notes: z.string().optional(),
});

export type CommitmentFormData = z.infer<typeof commitmentSchema>;

// ---- Target Schemas ----
export const targetSchema = z.object({
  month: z.string().min(1, 'الشهر مطلوب'),
  category_id: z.string().optional().nullable(),
  name: z.string().min(1, 'اسم الهدف مطلوب'),
  target_type: z.enum(['spending_limit', 'required_payment']),
  target_amount: z.number().positive('المبلغ المستهدف مطلوب'),
  bucket: z.enum(['personal', 'digi_whale']),
  notes: z.string().optional(),
});

export type TargetFormData = z.infer<typeof targetSchema>;

// ---- Project Schemas ----
export const projectSchema = z.object({
  name: z.string().min(1, 'اسم المشروع مطلوب'),
  client_name: z.string().optional(),
  status: z.enum(['lead', 'active', 'completed', 'cancelled']),
  expected_revenue: z.number().min(0),
  notes: z.string().optional(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

// ---- Person Schemas ----
export const personSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب'),
  type: z.enum(['employee', 'freelancer', 'sales']),
  role: z.string().optional(),
  monthly_salary: z.number().min(0).optional().nullable(),
  per_project_rate: z.number().min(0).optional().nullable(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  notes: z.string().optional(),
  is_active: z.boolean(),
});

export type PersonFormData = z.infer<typeof personSchema>;
