'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Input } from '@/components/ui/fields';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/motion/Reveal';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const supabase = createClient();
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        setSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(searchParams.get('next') ?? '/account');
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="border hairline bg-parchment px-8 py-10 text-center">
        <p className="font-serif text-2xl">Accounts need Supabase</p>
        <p className="mx-auto mt-3 max-w-md text-sm text-smoke">
          This demo runs without credentials, so sign-in is disabled. Add your
          Supabase keys to <code className="text-charcoal">.env.local</code> (see README)
          to enable customer accounts and the admin dashboard.
        </p>
      </div>
    );
  }

  if (sent) {
    return (
      <div role="status" className="border border-terracotta/30 bg-terracotta/5 px-8 py-10 text-center">
        <p className="font-serif text-2xl">Check your inbox</p>
        <p className="mt-3 text-smoke">We’ve sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      {mode === 'signup' && (
        <Input id="au-name" label="Full name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
      )}
      <Input id="au-email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      <Input
        id="au-password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
        hint={mode === 'signup' ? 'At least 8 characters.' : undefined}
      />
      {error && <p role="alert" className="text-sm text-terracotta">{error}</p>}
      <Button type="submit" loading={loading} className="w-full" size="lg">
        {mode === 'signup' ? 'Create account' : 'Sign in'}
      </Button>
      <p className="text-center text-sm text-smoke">
        {mode === 'signup' ? (
          <>Already have an account? <Link href="/login" className="link-sweep text-terracotta">Sign in</Link></>
        ) : (
          <>New here? <Link href="/signup" className="link-sweep text-terracotta">Create an account</Link></>
        )}
      </p>
    </form>
  );
}

export function AuthPageShell({ mode }: { mode: 'login' | 'signup' }) {
  return (
    <div className="mx-auto max-w-md px-5 pb-24 pt-32 md:pt-40">
      <Reveal>
        <p className="micro-label text-center">{mode === 'signup' ? 'Join us' : 'Welcome back'}</p>
        <h1 className="mt-4 text-center font-serif text-5xl">
          {mode === 'signup' ? 'Create your account' : 'Sign in'}
        </h1>
        <p className="mt-4 text-center text-[15px] text-smoke">
          {mode === 'signup'
            ? 'Track orders, save artworks, and check out faster.'
            : 'Your orders and saved artworks are waiting.'}
        </p>
        <div className="mt-10">
          <AuthForm mode={mode} />
        </div>
      </Reveal>
    </div>
  );
}
