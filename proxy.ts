import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

// Solo usamos authConfig (sin Node modules) para que corra en Edge Runtime
export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};