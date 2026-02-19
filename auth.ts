import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import type { RowDataPacket } from 'mysql2';
import { getDb } from '@/lib/mysql';

type DbUser = RowDataPacket & {
  id: number;
  usuario: string;
  correo: string;
  password: string;
  grupo: 'usuario' | 'admin' | 'editor';
  nivel: number;
  xp: number;
  estado: 'Activo' | 'Inactivo' | 'Suspendido';
  nombre_invocador: string | null;
  tag: string | null;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  grupo: DbUser['grupo'];
  nivel: number;
  xp: number;
  estado: DbUser['estado'];
  nombre_invocador: string | null;
  tag: string | null;
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        login: { label: 'Usuario o correo', type: 'text' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        const login = (credentials?.login as string)?.trim() ?? '';
        const password = (credentials?.password as string) ?? '';

        if (!login || !password) return null;

        const db = getDb();
        const [rows] = await db.query<DbUser[]>(
          `SELECT id, usuario, correo, password, grupo, nivel, xp, estado, nombre_invocador, tag
           FROM usuarios
           WHERE (usuario = ? OR correo = ?) AND estado = 'Activo'
           LIMIT 1`,
          [login, login]
        );

        if (rows.length === 0) return null;

        const user = rows[0];
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        const sessionUser: SessionUser = {
          id: String(user.id),
          name: user.usuario,
          email: user.correo,
          grupo: user.grupo,
          nivel: user.nivel,
          xp: user.xp,
          estado: user.estado,
          nombre_invocador: user.nombre_invocador,
          tag: user.tag,
        };

        return sessionUser;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const sessionUser = user as SessionUser;
        token.id = sessionUser.id;
        token.grupo = sessionUser.grupo;
        token.nivel = sessionUser.nivel;
        token.xp = sessionUser.xp;
        token.estado = sessionUser.estado;
        token.nombre_invocador = sessionUser.nombre_invocador ?? null;
        token.tag = sessionUser.tag ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      // Garantiza que session.user exista antes de mutar campos extra
      session.user = session.user ?? { name: token.name ?? '', email: token.email ?? '' };

      session.user.id = (token.id as string) ?? '';
      session.user.grupo = token.grupo as SessionUser['grupo'];
      session.user.nivel = Number(token.nivel ?? 0);
      session.user.xp = Number(token.xp ?? 0);
      session.user.estado = token.estado as SessionUser['estado'];
      session.user.nombre_invocador = (token.nombre_invocador as string | null) ?? null;
      session.user.tag = (token.tag as string | null) ?? null;
      return session;
    },
  },

  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7, // 7 días
  },

  secret: process.env.NEXTAUTH_SECRET,
});
