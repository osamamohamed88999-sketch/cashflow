'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Person } from '@/types/database';

export async function getPeople(): Promise<Person[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('people')
    .select('*')
    .eq('user_id', user.id)
    .order('name');

  return data || [];
}

export async function createPerson(data: {
  name: string;
  type: string;
  role?: string;
  monthly_salary?: number | null;
  per_project_rate?: number | null;
  phone?: string;
  email?: string;
  notes?: string;
  is_active: boolean;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('غير مسجل دخول');

  const { error } = await supabase.from('people').insert({
    user_id: user.id,
    name: data.name,
    type: data.type,
    role: data.role || null,
    monthly_salary: data.monthly_salary || null,
    per_project_rate: data.per_project_rate || null,
    phone: data.phone || null,
    email: data.email || null,
    notes: data.notes || null,
    is_active: data.is_active,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/people');
  revalidatePath('/digi-whale');
}

export async function updatePerson(id: string, data: Partial<{
  name: string;
  type: string;
  role: string;
  monthly_salary: number | null;
  per_project_rate: number | null;
  phone: string;
  email: string;
  notes: string;
  is_active: boolean;
}>) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('people')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/people');
}

export async function deletePerson(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('people').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/people');
}
