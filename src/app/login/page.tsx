import { Suspense } from 'react';
import { AuthPageShell } from '@/components/auth/AuthForm';

export const metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="micro-label pt-40 text-center">Loading…</p>}>
      <AuthPageShell mode="login" />
    </Suspense>
  );
}
