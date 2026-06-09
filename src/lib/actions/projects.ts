'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Project } from '@/types/database';

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return data || [];
}

export async function createProject(data: {
  name: string;
  client_name?: string;
  status: string;
  expected_revenue: number;
  notes?: string;
  start_date?: string | null;
  end_date?: string | null;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('غير مسجل دخول');

  const { error } = await supabase.from('projects').insert({
    user_id: user.id,
    name: data.name,
    client_name: data.client_name || null,
    status: data.status,
    expected_revenue: data.expected_revenue,
    notes: data.notes || null,
    start_date: data.start_date || null,
    end_date: data.end_date || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/projects');
  revalidatePath('/digi-whale');
}

export async function updateProject(id: string, data: Partial<{
  name: string;
  client_name: string;
  status: string;
  expected_revenue: number;
  collected_revenue: number;
  project_expenses: number;
  notes: string;
  start_date: string | null;
  end_date: string | null;
}>) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('projects')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/projects');
  revalidatePath('/digi-whale');
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/projects');
  revalidatePath('/digi-whale');
}
