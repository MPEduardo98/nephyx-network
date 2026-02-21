import NextAuth from 'next-auth';
import { authConfig } from '@/app/auth/libs/auth.config';

// Next.js 16 renombró middleware.ts a proxy.ts
export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};