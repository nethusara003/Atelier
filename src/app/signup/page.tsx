import { Suspense } from 'react';
import { AuthPageShell } from '@/components/auth/AuthForm';

export const metadata = { title: 'Create account' };

export default function SignupPage() {
  return (
    <Suspense fallback={<p className="micro-label pt-40 text-center">Loading…</p>}>
      <AuthPageShell mode="signup" />
    </Suspense>
  );
}
