import { getDb } from '@/global/lib/mysql';
import type { RowDataPacket } from 'mysql2';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Torneo extends RowDataPacket {
  id: number;
  nombre: string;
  informacion: string | null;
  costo: string;
  equipos: number;
  liga_id: number | null;
  liga_nombre: string | null;
  temporada: number;
  fecha_inicio: Date;
  fecha_fin: Date;
  inscripcion_inicio: Date;
  inscripcion_fin: Date;
  estado: string;
  slug: string;
  campeon: string | null;
  bolsa_premios: string | null;
}

// ── Helpers de formato ─────────────────────────────────────────────────────────

/** Elimina etiquetas HTML y entidades, retorna texto plano truncado */
export function stripHtml(html: string | null, maxLen = 110): string {
  if (!html) return '';
  const entities: Record<string, string> = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
    '&aacute;': 'á', '&eacute;': 'é', '&iacute;': 'í', '&oacute;': 'ó', '&uacute;': 'ú',
    '&ntilde;': 'ñ', '&Aacute;': 'Á', '&Eacute;': 'É', '&Iacute;': 'Í', '&Oacute;': 'Ó',
    '&Uacute;': 'Ú', '&Ntilde;': 'Ñ', '&nbsp;': ' ',
  };
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, (e) => entities[e] ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > maxLen ? text.slice(0, maxLen).trimEnd() + '…' : text;
}

export function formatPrize(value: string | null): string {
  const num = Number(value ?? 0);
  if (num === 0) return 'Por definir';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: 'MXN', maximumFractionDigits: 2,
  }).format(num);
}

export function formatCosto(value: string): string {
  const num = Number(value ?? 0);
  if (num === 0) return 'Gratis';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: 'MXN', maximumFractionDigits: 2,
  }).format(num);
}

export function getStatusType(estado: string): 'open' | 'active' | 'soon' | 'closed' {
  if (estado === 'Abierto')    return 'open';
  if (estado === 'Activo')     return 'active';
  if (estado === 'Cerrado')    return 'closed';
  return 'soon';
}

export function getStatusLabel(estado: string): string {
  const map: Record<string, string> = {
    Abierto:    'Inscripciones abiertas',
    Activo:     'Activo',
    Preparando: 'Próximamente',
    Cerrado:    'Cerrado',
  };
  return map[estado] ?? estado;
}

// ── SELECT base reutilizable ───────────────────────────────────────────────────

const BASE_SELECT = `
  SELECT
    t.id,
    t.nombre,
    t.informacion,
    t.costo,
    t.equipos,
    t.liga_id,
    COALESCE(l.nombre, t.liga) AS liga_nombre,
    t.temporada,
    t.fecha_inicio,
    t.fecha_fin,
    t.inscripcion_inicio,
    t.inscripcion_fin,
    t.estado,
    t.slug,
    t.campeon,
    COALESCE(SUM(tp.valor), 0) AS bolsa_premios
  FROM torneos t
  LEFT JOIN ligas l            ON l.id = t.liga_id
  LEFT JOIN torneos_premios tp ON tp.torneo_id = t.id
`;

const BASE_GROUP = `
  GROUP BY
    t.id, t.nombre, t.informacion, t.costo, t.equipos,
    t.liga_id, t.liga, t.temporada, t.fecha_inicio, t.fecha_fin,
    t.inscripcion_inicio, t.inscripcion_fin, t.estado, t.slug, t.campeon
`;

// ── Queries ────────────────────────────────────────────────────────────────────

/**
 * Torneos destacados para la home.
 * Solo activos/abiertos/preparando, máximo 6, ordenados por estado y fecha.
 */
export async function getTorneosDestacados(limit = 6): Promise<Torneo[]> {
  try {
    const db = getDb();
    const [rows] = await db.query<Torneo[]>(`
      ${BASE_SELECT}
      WHERE t.estado IN ('Preparando', 'Abierto', 'Activo')
      ${BASE_GROUP}
      ORDER BY FIELD(t.estado, 'Abierto', 'Activo', 'Preparando'), t.fecha_inicio ASC
      LIMIT ?
    `, [limit]);
    return rows;
  } catch (err) {
    console.error('[torneos] getTorneosDestacados error:', err);
    return [];
  }
}

/**
 * Listado completo de torneos para /torneos.
 * Acepta filtro opcional por estado y liga_id.
 */
export async function getTorneos(filters?: {
  estado?: string;
  liga_id?: number;
  limit?: number;
  offset?: number;
}): Promise<Torneo[]> {
  try {
    const db = getDb();
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (filters?.estado) {
      conditions.push('t.estado = ?');
      params.push(filters.estado);
    }
    if (filters?.liga_id) {
      conditions.push('t.liga_id = ?');
      params.push(filters.liga_id);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit  = filters?.limit  ?? 20;
    const offset = filters?.offset ?? 0;

    const [rows] = await db.query<Torneo[]>(`
      ${BASE_SELECT}
      ${where}
      ${BASE_GROUP}
      ORDER BY t.fecha_inicio DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);
    return rows;
  } catch (err) {
    console.error('[torneos] getTorneos error:', err);
    return [];
  }
}

/**
 * Un torneo por su slug — para /torneos/[slug].
 * Retorna null si no existe.
 */
export async function getTorneoBySlug(slug: string): Promise<Torneo | null> {
  try {
    const db = getDb();
    const [rows] = await db.query<Torneo[]>(`
      ${BASE_SELECT}
      WHERE t.slug = ?
      ${BASE_GROUP}
      LIMIT 1
    `, [slug]);
    return rows[0] ?? null;
  } catch (err) {
    console.error('[torneos] getTorneoBySlug error:', err);
    return null;
  }
}

/**
 * Un torneo por su id — para páginas internas.
 * Retorna null si no existe.
 */
export async function getTorneoById(id: number): Promise<Torneo | null> {
  try {
    const db = getDb();
    const [rows] = await db.query<Torneo[]>(`
      ${BASE_SELECT}
      WHERE t.id = ?
      ${BASE_GROUP}
      LIMIT 1
    `, [id]);
    return rows[0] ?? null;
  } catch (err) {
    console.error('[torneos] getTorneoById error:', err);
    return null;
  }
}