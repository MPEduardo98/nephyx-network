import { DefaultSession } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      grupo: 'usuario' | 'admin' | 'editor';
      nivel: number;
      xp: number;
      estado: 'Activo' | 'Inactivo' | 'Suspendido';
      nombre_invocador: string | null;
      tag: string | null;
    } & DefaultSession['user'];
  }

  // Extiende el User que retorna authorize() con los campos extra
  interface User {
    grupo?: 'usuario' | 'admin' | 'editor';
    nivel?: number;
    xp?: number;
    estado?: 'Activo' | 'Inactivo' | 'Suspendido';
    nombre_invocador?: string | null;
    tag?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id?: string;
    grupo?: 'usuario' | 'admin' | 'editor';
    nivel?: number;
    xp?: number;
    estado?: 'Activo' | 'Inactivo' | 'Suspendido';
    nombre_invocador?: string | null;
    tag?: string | null;
  }
}