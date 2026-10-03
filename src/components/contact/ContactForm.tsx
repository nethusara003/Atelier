'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { contactSchema } from '@/lib/validations';
import { Input, Textarea, Select } from '@/components/ui/fields';
import { Button } from '@/components/ui/Button';

const TYPE_OPTIONS = [
  { value: 'general', label: 'General enquiry' },
  { value: 'purchase', label: 'About a piece' },
  { value: 'press', label: 'Press' },
  { value: 'visit', label: 'Studio visit' },
  { value: 'other', label: 'Something else' },
];

type Errors = Partial<Record<string, string>>;

function ContactFormInner() {
  const searchParams = useSearchParams();
  const [values, setValues] = useState({
    name: '',
    email: '',
    subject: searchParams.get('subject') ?? '',
    inquiryType: 'general',
    message: '',
    preferredDate: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [serverError, setServerError] = useState('');

  const set = (k: keyof typeof values) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse({
      ...values,
      preferredDate: values.preferredDate || undefined,
    });
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
      const res = await fetch('/api/contact', {
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
        <p className="font-serif text-3xl">Message received.</p>
        <p className="mx-auto mt-4 max-w-md text-smoke">
          Thank you for writing to the studio. Elena replies personally within three working days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Input id="ct-name" label="Your name" value={values.name} onChange={set('name')} error={errors.name} autoComplete="name" />
        <Input id="ct-email" label="Email" type="email" value={values.email} onChange={set('email')} error={errors.email} autoComplete="email" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <Select id="ct-type" label="Topic" options={TYPE_OPTIONS} value={values.inquiryType} onChange={set('inquiryType')} error={errors.inquiryType} />
        <Input id="ct-subject" label="Subject" value={values.subject} onChange={set('subject')} error={errors.subject} placeholder="e.g. Morning Vessel I" />
      </div>
      <Textarea id="ct-message" label="Message" value={values.message} onChange={set('message')} error={errors.message} rows={6} />
      {values.inquiryType === 'visit' && (
        <Input
          id="ct-date"
          label="Preferred visit date"
          type="date"
          value={values.preferredDate}
          onChange={set('preferredDate')}
          error={errors.preferredDate}
          hint="Studio visits: Thursday – Saturday, 10:00 – 17:00. We’ll confirm by email."
          min={new Date().toISOString().split('T')[0]}
        />
      )}
      {status === 'error' && <p role="alert" className="text-sm text-terracotta">{serverError}</p>}
      <Button type="submit" loading={status === 'loading'} size="lg">
        Send message
      </Button>
    </form>
  );
}

export function ContactForm() {
  return (
    <Suspense fallback={<p className="micro-label">Loading form…</p>}>
      <ContactFormInner />
    </Suspense>
  );
}
