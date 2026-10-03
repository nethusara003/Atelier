'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <button
      onClick={async () => {
        setLoading(true);
        try {
          await createClient().auth.signOut();
        } finally {
          router.push('/');
          router.refresh();
        }
      }}
      disabled={loading}
      className="link-sweep text-xs uppercase tracking-widest2 text-stone hover:text-terracotta disabled:opacity-50"
    >
      {loading ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
