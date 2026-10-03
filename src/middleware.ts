import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Refreshes the Supabase auth session on every request and guards
 * /account/* (signed-in users) and /admin/* (role check happens in the
 * admin layout, server-side, where the service-role-free session is enough).
 * In demo mode (no Supabase env) the guards are skipped so the site and the
 * demo admin can be explored without credentials.
 */
export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const demoMode =
    !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (demoMode) return response;

  const needsAuth =
    pathname.startsWith('/account') || pathname.startsWith('/admin');

  if (needsAuth && !user) {
    const login = request.nextUrl.clone();
    login.pathname = '/login';
    login.searchParams.set('next', pathname);
    return NextResponse.redirect(login);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
