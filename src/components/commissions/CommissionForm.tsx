'use client';

import { useState } from 'react';
import { commissionSchema } from '@/lib/validations';
import { Input, Textarea, Select } from '@/components/ui/fields';
import { Button } from '@/components/ui/Button';

const TYPE_OPTIONS = [
  { value: 'painting', label: 'Painting' },
  { value: 'ceramics', label: 'Ceramics' },
  { value: 'sculpture', label: 'Sculpture' },
  { value: 'textile', label: 'Textile art' },
  { value: 'decor', label: 'Home décor' },
  { value: 'other', label: 'Something else' },
];
const BUDGET_OPTIONS = [
  { value: 'under_500', label: 'Under $500' },
  { value: '500_1500', label: '$500 – $1,500' },
  { value: '1500_5000', label: '$1,500 – $5,000' },
  { value: '5000_plus', label: '$5,000+' },
];
const TIMELINE_OPTIONS = [
  { value: 'flexible', label: 'Flexible — whenever it’s ready' },
  { value: '1_2_months', label: '1–2 months' },
  { value: '3_6_months', label: '3–6 months' },
  { value: '6_plus_months', label: '6+ months' },
];

type Errors = Partial<Record<string, string>>;

export function CommissionForm() {
  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    commissionType: 'painting',
    budgetRange: '500_1500',
    timeline: 'flexible',
    description: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [serverError, setServerError] = useState('');

  const set = (k: keyof typeof values) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = commissionSchema.safeParse({ ...values, referenceImages: [] });
    if (!parsed.success) {
      const errs: Errors = {};
      parsed.error.issues.forEach((i) => {
        const key = String(i.path[0] ?? '');
        if (key && !errs[key]) errs[key] = i.message;
      });
      setErrors(errs);
      return;
    }
    setErrors({});
    setStatus('loading');
    try {
      const res = await fetch('/api/commissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Something went wrong. Please try again.');
      }
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setServerError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  if (status === 'done') {
    return (
      <div role="status" className="border border-terracotta/30 bg-terracotta/5 px-8 py-10 text-center">
        <p className="font-serif text-3xl">Thank you — your enquiry is with the studio.</p>
        <p className="mx-auto mt-4 max-w-md text-smoke">
          Elena reads every commission enquiry personally and replies within two working days.
          A confirmation has been sent to your email.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Input id="c-name" label="Your name" value={values.name} onChange={set('name')} error={errors.name} autoComplete="name" />
        <Input id="c-email" label="Email" type="email" value={values.email} onChange={set('email')} error={errors.email} autoComplete="email" />
      </div>
      <Input id="c-phone" label="Phone (optional)" type="tel" value={values.phone} onChange={set('phone')} error={errors.phone} autoComplete="tel" />
      <div className="grid gap-6 sm:grid-cols-3">
        <Select id="c-type" label="Type of work" options={TYPE_OPTIONS} value={values.commissionType} onChange={set('commissionType')} error={errors.commissionType} />
        <Select id="c-budget" label="Budget range" options={BUDGET_OPTIONS} value={values.budgetRange} onChange={set('budgetRange')} error={errors.budgetRange} />
        <Select id="c-timeline" label="Timeline" options={TIMELINE_OPTIONS} value={values.timeline} onChange={set('timeline')} error={errors.timeline} />
      </div>
      <Textarea
        id="c-description"
        label="Describe your vision"
        value={values.description}
        onChange={set('description')}
        error={errors.description}
        hint="Sizes, colours, the room it will live in, the feeling you want — the more detail, the better the reply."
        rows={6}
      />
      {status === 'error' && (
        <p role="alert" className="text-sm text-terracotta">{serverError}</p>
      )}
      <Button type="submit" loading={status === 'loading'} size="lg">
        Send commission enquiry
      </Button>
      <p className="text-xs text-stone">
        No payment is taken at this stage. Every commission begins with a conversation.
      </p>
    </form>
  );
}
