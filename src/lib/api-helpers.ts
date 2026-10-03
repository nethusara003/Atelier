import { isSupabaseConfigured } from './supabase/client';

/**
 * Inserts a row via the service-role client (bypasses RLS intentionally —
 * these are the public-insert tables). In demo mode, logs instead.
 */
export async function insertPublicRow(table: string, row: Record<string, unknown>) {
  if (!isSupabaseConfigured) {
    console.log(`[api:demo] would insert into ${table}:`, row);
    return;
  }
  const { createAdminClient } = await import('./supabase/admin');
  const admin = createAdminClient();
  const { error } = await admin.from(table).insert(row);
  if (error) throw new Error(`Database error: ${error.message}`);
}
