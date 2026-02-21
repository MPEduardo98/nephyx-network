import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import type { RowDataPacket } from 'mysql2';
import { getDb } from '@/global/lib/mysql';
import { authConfig } from '@/app/auth/libs/auth.config';

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
  ...authConfig,
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

        try {
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

          return {
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
        } catch (error) {
          console.error('[NextAuth] authorize error:', error);
          return null;
        }
      },
    }),
  ],

  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
});