'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Category } from '@/types/database';

export async function getCategories(filters?: { type?: string; bucket?: string }): Promise<Category[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('name');

  if (filters?.type) query = query.eq('type', filters.type);
  if (filters?.bucket) query = query.eq('bucket', filters.bucket);

  const { data } = await query;
  return data || [];
}

export async function createCategory(data: { name: string; type: string; bucket: string; icon?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('غير مسجل دخول');

  const { error } = await supabase.from('categories').insert({
    user_id: user.id,
    name: data.name,
    type: data.type,
    bucket: data.bucket,
    icon: data.icon || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/settings');
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/settings');
}
