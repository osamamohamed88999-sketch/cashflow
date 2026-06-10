// ============================================================
// Database Types — Mirrors Supabase Schema
// ============================================================

export type AccountType = 'bank' | 'cash' | 'wallet' | 'business';
export type TransactionType = 'income' | 'expense' | 'transfer' | 'adjustment';
export type TransactionStatus = 'paid' | 'pending' | 'partial';
export type Bucket = 'personal' | 'digi_whale';
export type CategoryType = 'income' | 'expense';
export type PersonType = 'employee' | 'freelancer' | 'sales';
export type ProjectStatus = 'lead' | 'active' | 'completed' | 'cancelled';
export type CommitmentType = 'fixed' | 'temporary';
export type TargetType = 'spending_limit' | 'required_payment';

// ---- Profiles ----
export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

// ---- Accounts ----
export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  opening_balance: number;
  currency: string;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccountWithBalance extends Account {
  current_balance: number;
  balance_change: number;
  balance_change_pct: number;
}

// ---- Categories ----
export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: CategoryType;
  bucket: Bucket;
  icon: string | null;
  color: string | null;
  is_default: boolean;
  created_at: string;
}

// ---- Transactions ----
export interface Transaction {
  id: string;
  user_id: string;
  date: string;
  type: TransactionType;
  account_id: string;
  destination_account_id: string | null;
  amount: number;
  paid_amount: number | null;
  category_id: string | null;
  project_id: string | null;
  person_id: string | null;
  bucket: Bucket;
  status: TransactionStatus;
  notes: string | null;
  is_recurring: boolean;
  adjustment_reason: string | null;
  created_at: string;
}

export interface TransactionWithRelations extends Transaction {
  account?: Account;
  destination_account?: Account;
  category?: Category;
  project?: Project;
  person?: Person;
}

// ---- People ----
export interface Person {
  id: string;
  user_id: string;
  name: string;
  type: PersonType;
  role: string | null;
  monthly_salary: number | null;
  per_project_rate: number | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ---- Projects ----
export interface Project {
  id: string;
  user_id: string;
  name: string;
  client_name: string | null;
  status: ProjectStatus;
  expected_revenue: number;
  collected_revenue: number;
  project_expenses: number;
  notes: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

// ---- Monthly Commitments ----
export interface MonthlyCommitment {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  category_id: string | null;
  account_id: string | null;
  due_day: number;
  bucket: Bucket;
  is_active: boolean;
  commitment_type: CommitmentType;
  start_month: string | null;
  end_month: string | null;
  auto_create: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type CommitmentStatus = 'paid' | 'partial' | 'overdue' | 'pending';

export interface CommitmentWithStatus extends MonthlyCommitment {
  status: CommitmentStatus;
  paid_amount: number;
  remaining: number;
  category?: Category;
  account?: Account;
}

// ---- Monthly Targets ----
export interface MonthlyTarget {
  id: string;
  user_id: string;
  month: string;
  category_id: string | null;
  name: string;
  target_type: TargetType;
  target_amount: number;
  bucket: Bucket;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type TargetStatus = 'on_track' | 'completed' | 'exceeded' | 'underpaid';

export interface TargetWithProgress extends MonthlyTarget {
  current_amount: number;
  remaining: number;
  status: TargetStatus;
  percentage: number;
  category?: Category;
}

// ---- Settings ----
export interface Settings {
  id: string;
  user_id: string;
  default_account_id: string | null;
  month_start_day: number;
  show_digi_whale: boolean;
  created_at: string;
  updated_at: string;
}

// ---- Dashboard Types ----
export interface DashboardStats {
  totalBalance: number;
  personalBankBalance: number;
  bankOpeningBalance: number;
  bankBalanceChange: number;
  bankBalanceChangePct: number;
  bankCycleStartBalance: number;
  bankCycleChange: number;
  bankCycleChangePct: number;
  monthIncome: number;
  monthExpenses: number;
  monthNet: number;
  digiWhaleIncome: number;
  digiWhaleExpenses: number;
  digiWhaleNet: number;
  remainingCommitments: number;
  spendingChangePct: number;
  commitmentsTotal: number;
  futureCommitmentsTotal: number;
  commitmentsDeducted: number;
  netProfitAfterDeductions: number;
  deductionsApplied: boolean;
  smartOpinion: string;
  todayIncome?: number;
  todayExpenses?: number;
  todayNet?: number;
}

export interface CategoryBreakdown {
  name: string;
  amount: number;
  color: string;
  icon: string;
  percentage: number;
}

export interface MonthlyChartData {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export interface DailyCashflowData {
  date: string;
  income: number;
  expenses: number;
  net: number;
}

export interface SmartInsight {
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  icon: string;
}
