import { NextResponse } from 'next/server';
import { getDb } from '@/global/lib/mysql';
import type { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();

    const [[usuariosRow], [torneosRow], [activasRow], [premiosRow]] =
      await Promise.all([
        db.query<RowDataPacket[]>(
          `SELECT COUNT(*) AS total FROM usuarios WHERE activo = 1`
        ),
        db.query<RowDataPacket[]>(
          `SELECT COUNT(*) AS total FROM torneos`
        ),
        db.query<RowDataPacket[]>(
          `SELECT COUNT(*) AS total FROM torneos WHERE estado IN ('inscripcion', 'en_curso')`
        ),
        db.query<RowDataPacket[]>(
          `SELECT COALESCE(SUM(premio_total), 0) AS total FROM torneos WHERE estado = 'finalizado'`
        ),
      ]);

    const usuarios: number = usuariosRow[0]?.total ?? 0;
    const torneos: number = torneosRow[0]?.total ?? 0;
    const activas: number = activasRow[0]?.total ?? 0;
    const premios: number = Number(premiosRow[0]?.total ?? 0);

    // Formatear valores para mostrar
    const formatNumber = (n: number): string => {
      if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
      if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1000 === 0 ? 0 : 1)}K+`;
      return String(n);
    };

    const formatPremios = (n: number): string => {
      if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
      if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
      return `$${n}`;
    };

    return NextResponse.json({
      usuarios: formatNumber(usuarios),
      torneos: formatNumber(torneos),
      activas: String(activas),
      premios: formatPremios(premios),
    });
  } catch (error) {
    console.error('[/api/stats] Error:', error);
    return NextResponse.json(
      { error: 'No se pudieron cargar las estadísticas.' },
      { status: 500 }
    );
  }
}