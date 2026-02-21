import type { NextAuthConfig } from 'next-auth';

// Rutas protegidas (requieren sesión)
const PROTECTED_PREFIXES = ['/dashboard', '/perfil', '/admin', '/settings'];

// Rutas solo para usuarios NO autenticados
const AUTH_ONLY_ROUTES = ['/auth/login', '/auth/register'];

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7, // 7 días
  },

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
      const isAuthRoute = AUTH_ONLY_ROUTES.some((p) => pathname.startsWith(p));

      // No autenticado intentando acceder a ruta protegida → redirigir a login
      if (isProtected && !isLoggedIn) return false;

      // Autenticado intentando acceder a login/register → redirigir al home
      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL('/', nextUrl.origin));
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? '';
        token.grupo = (user as any).grupo;
        token.nivel = (user as any).nivel;
        token.xp = (user as any).xp;
        token.estado = (user as any).estado;
        token.nombre_invocador = (user as any).nombre_invocador ?? null;
        token.tag = (user as any).tag ?? null;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? '';
        session.user.grupo = token.grupo as any;
        session.user.nivel = Number(token.nivel ?? 0);
        session.user.xp = Number(token.xp ?? 0);
        session.user.estado = token.estado as any;
        session.user.nombre_invocador = (token.nombre_invocador as string | null) ?? null;
        session.user.tag = (token.tag as string | null) ?? null;
      }
      return session;
    },
  },

  providers: [], // Los providers van en auth.ts (Node runtime)
};