'use client';

import { useState } from 'react';
import { newsletterSchema } from '@/lib/validations';
import { Button } from '../ui/Button';

export function NewsletterSignup({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = newsletterSchema.safeParse({ email });
    if (!parsed.success) {
      setStatus('error');
      setMessage(parsed.error.issues[0]?.message ?? 'Please enter a valid email.');
      return;
    }
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: parsed.data.email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Something went wrong.');
      }
      setStatus('done');
      setMessage('Welcome to the studio letter. Your first note arrives soon.');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  return (
    <div className={compact ? '' : 'mx-auto max-w-2xl text-center'}>
      {!compact && (
        <>
          <p className="micro-label">The studio letter</p>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl">First to see new work</h2>
          <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-smoke">
            A short letter, roughly monthly — new pieces before they reach the gallery,
            kiln notes, and studio visits. No noise, unsubscribe anytime.
          </p>
        </>
      )}
      {status === 'done' ? (
        <p role="status" className="mt-8 border border-terracotta/30 bg-terracotta/5 px-6 py-5 text-[15px] text-terracotta">
          {message}
        </p>
      ) : (
        <form onSubmit={submit} className={`mt-8 flex flex-col gap-3 sm:flex-row ${compact ? '' : 'justify-center'}`} noValidate>
          <label htmlFor={compact ? 'nl-compact' : 'nl-main'} className="sr-only">
            Email address
          </label>
          <input
            id={compact ? 'nl-compact' : 'nl-main'}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={status === 'loading'}
            className="w-full border hairline bg-transparent px-5 py-3.5 text-[15px] placeholder:text-stone/70 focus:border-terracotta focus:outline-none sm:max-w-sm"
          />
          <Button type="submit" loading={status === 'loading'}>
            Subscribe
          </Button>
        </form>
      )}
      {status === 'error' && (
        <p role="alert" className="mt-3 text-sm text-terracotta">{message}</p>
      )}
    </div>
  );
}
