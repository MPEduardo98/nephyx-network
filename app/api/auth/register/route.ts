import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { getDb } from '@/lib/mysql';

export const runtime = 'nodejs';

type RegisterBody = {
  step: 1 | 2 | 3;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  password?: string;
  confirmPassword?: string;
  promos?: boolean;
  terms?: boolean;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterBody;
    const { step } = body;

    // ── PASO 1: Validar usuario y correo ──────────────────────────────────────
    if (step === 1) {
      const username = body.username?.trim() ?? '';
      const email = body.email?.trim().toLowerCase() ?? '';

      if (!username || !email) {
        return NextResponse.json(
          { message: 'Usuario y correo son obligatorios.' },
          { status: 400 }
        );
      }
      if (username.length < 3) {
        return NextResponse.json(
          { message: 'El usuario debe tener al menos 3 caracteres.' },
          { status: 400 }
        );
      }
      if (username.length > 15) {
        return NextResponse.json(
          { message: 'El usuario no puede tener más de 15 caracteres.' },
          { status: 400 }
        );
      }
      const usernamePattern = /^[a-zA-Z0-9_]+$/;
      if (!usernamePattern.test(username)) {
        return NextResponse.json(
          { message: 'El usuario solo puede contener letras, números y guiones bajos (_).' },
          { status: 400 }
        );
      }
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        return NextResponse.json(
          { message: 'Correo electrónico inválido.' },
          { status: 400 }
        );
      }

      const db = getDb();
      const [existsRows] = await db.query<
        (RowDataPacket & { usuario: string; correo: string })[]
      >(
        `SELECT usuario, correo FROM usuarios WHERE usuario = ? OR correo = ? LIMIT 1`,
        [username, email]
      );

      if (existsRows.length > 0) {
        const isUserTaken =
          existsRows[0].usuario.toLowerCase() === username.toLowerCase();
        return NextResponse.json(
          { message: isUserTaken ? 'Ese nombre de usuario ya existe.' : 'Ese correo ya está registrado.' },
          { status: 409 }
        );
      }

      return NextResponse.json({ message: 'OK' }, { status: 200 });
    }

    // ── PASO 2: Validar nombre, apellido y país ───────────────────────────────
    if (step === 2) {
      const nombre = body.firstName?.trim() ?? '';
      const apellido = body.lastName?.trim() ?? '';
      const pais = body.country?.trim() ?? '';

      if (!nombre || !apellido) {
        return NextResponse.json(
          { message: 'Nombre y apellido son obligatorios.' },
          { status: 400 }
        );
      }
      if (!pais) {
        return NextResponse.json(
          { message: 'El país es obligatorio.' },
          { status: 400 }
        );
      }

      return NextResponse.json({ message: 'OK' }, { status: 200 });
    }

    // ── PASO 3: Validar contraseña e insertar ─────────────────────────────────
    if (step === 3) {
      const username = body.username?.trim() ?? '';
      const email = body.email?.trim().toLowerCase() ?? '';
      const nombre = body.firstName?.trim() ?? '';
      const apellido = body.lastName?.trim() ?? '';
      const pais = body.country?.trim().toUpperCase() || null;
      const password = body.password ?? '';
      const confirmPassword = body.confirmPassword ?? '';
      const promos = Boolean(body.promos);
      const terms = Boolean(body.terms);

      if (!password || !confirmPassword) {
        return NextResponse.json(
          { message: 'La contraseña es obligatoria.' },
          { status: 400 }
        );
      }
      if (password.length < 8) {
        return NextResponse.json(
          { message: 'La contraseña debe tener al menos 8 caracteres.' },
          { status: 400 }
        );
      }
      if (password !== confirmPassword) {
        return NextResponse.json(
          { message: 'Las contraseñas no coinciden.' },
          { status: 400 }
        );
      }
      if (!terms) {
        return NextResponse.json(
          { message: 'Debes aceptar los Términos y Condiciones.' },
          { status: 400 }
        );
      }

      const db = getDb();

      // Re-verificar duplicados por si pasó tiempo entre pasos
      const [existsRows] = await db.query<
        (RowDataPacket & { usuario: string; correo: string })[]
      >(
        `SELECT usuario, correo FROM usuarios WHERE usuario = ? OR correo = ? LIMIT 1`,
        [username, email]
      );

      if (existsRows.length > 0) {
        const isUserTaken =
          existsRows[0].usuario.toLowerCase() === username.toLowerCase();
        return NextResponse.json(
          { message: isUserTaken ? 'Ese nombre de usuario ya existe.' : 'Ese correo ya está registrado.' },
          { status: 409 }
        );
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const [result] = await db.query<ResultSetHeader>(
        `INSERT INTO usuarios
          (usuario, correo, password, ofertas, email_verified, grupo, nivel, xp, estado, nombre_invocador, tag)
         VALUES (?, ?, ?, ?, 0, 'usuario', 1, 0, 'Activo', ?, ?)`,
        [username, email, passwordHash, promos ? 1 : 0, nombre || null, pais]
      );

      const userId = result.insertId;

      await db.query(
        `INSERT INTO usuarios_datos_personales (usuario_id, nombre, apellido, pais)
         VALUES (?, ?, ?, ?)`,
        [userId, nombre, apellido, pais]
      );

      return NextResponse.json(
        { message: 'Registro completado.', userId },
        { status: 201 }
      );
    }

    return NextResponse.json({ message: 'Paso inválido.' }, { status: 400 });
  } catch (err) {
    console.error('Register API error:', err);
    return NextResponse.json(
      { message: 'No se pudo completar el registro.' },
      { status: 500 }
    );
  }
}