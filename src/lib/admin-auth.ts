import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from './supabase/server';
import { isSupabaseConfigured } from './supabase/client';

export interface AdminSession {
  demo: boolean;
  user: { id: string; email?: string } | null;
  isAdmin: boolean;
}

/**
 * Returns the current admin session. In demo mode (no Supabase) we pretend
 * to be an admin so the dashboard UI can be explored — all mutations are
 * disabled and clearly labelled.
 */
export async function getAdminSession(): Promise<AdminSession> {
  if (!isSupabaseConfigured) {
    return { demo: true, user: { id: 'demo-admin', email: 'demo@atelier.local' }, isAdmin: true };
  }
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { demo: false, user: null, isAdmin: false };
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  return { demo: false, user: { id: user.id, email: user.email }, isAdmin: profile?.role === 'admin' };
}

/** Page-level guard for the admin layout. */
export async function requireAdminPage(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session.demo && !session.user) redirect('/login?next=/admin');
  if (!session.isAdmin) redirect('/');
  return session;
}

/** Action-level guard. Throws (never redirects — actions must return, not navigate). */
export async function requireAdminAction(): Promise<void> {
  const session = await getAdminSession();
  if (session.demo) {
    throw new Error('Demo mode: connect Supabase to make changes.');
  }
  if (!session.isAdmin) {
    throw new Error('Not authorized.');
  }
}
