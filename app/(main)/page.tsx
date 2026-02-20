import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrophy, faUsers, faChevronRight, faCalendarAlt, faArrowRight,
  faCircle, faShield, faClock, faTicket, faLayerGroup, faBookOpen,
  faBolt, faMedal,
} from '@fortawesome/free-solid-svg-icons';
import { faDiscord, faTwitch, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { getDb } from '@/lib/mysql';
import type { RowDataPacket } from 'mysql2';
import TournamentBanner from '@/components/TournamentBanner';
import RankingTable, { type RankingRow } from '@/components/RankingTable';
import StatsCounter from '@/components/StatsCounter';
import {
  getTorneosDestacados,
  formatPrize,
  formatCosto,
  getStatusType,
  getStatusLabel,
  stripHtml,
} from '@/lib/torneos';

// ── Stats ─────────────────────────────────────────────────────────────────────
async function getStats() {
  try {
    const db = getDb();
    const [[usuariosRow], [torneosRow], [activasRow], [premiosRow]] = await Promise.all([
      db.query<RowDataPacket[]>(`SELECT COUNT(*) AS total FROM usuarios WHERE estado = 'Activo'`),
      db.query<RowDataPacket[]>(`SELECT COUNT(*) AS total FROM torneos`),
      db.query<RowDataPacket[]>(`SELECT COUNT(*) AS total FROM torneos WHERE estado IN ('Abierto', 'Activo')`),
      db.query<RowDataPacket[]>(`
        SELECT COALESCE(SUM(tp.valor), 0) AS total
        FROM torneos_premios tp
        INNER JOIN torneos t ON t.id = tp.torneo_id
        WHERE t.estado = 'Finalizado'
      `),
    ]);
    const fmt = (n: number) =>
      n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M+` :
      n >= 1_000     ? `${Math.floor(n / 1_000)}K+`       : String(n);
    const fmtPeso = (n: number) =>
      n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` :
      n >= 1_000     ? `$${Math.floor(n / 1_000)}K`       : `$${n}`;
    return {
      usuarios: fmt(Number(usuariosRow[0]?.total ?? 0)),
      torneos:  fmt(Number(torneosRow[0]?.total  ?? 0)),
      activas:  String(activasRow[0]?.total ?? 0),
      premios:  fmtPeso(Number(premiosRow[0]?.total ?? 0)),
    };
  } catch (err) {
    console.error('[Home] getStats error:', err);
    return { usuarios: '—', torneos: '—', activas: '—', premios: '—' };
  }
}

// ── Ranking ───────────────────────────────────────────────────────────────────
async function getRankingTop5(): Promise<RankingRow[]> {
  try {
    const db = getDb();
    const [rows] = await db.query<RankingRow[]>(`
      SELECT
        c.equipo_id,
        e.nombre,
        e.iniciales,
        c.puntos,
        c.victorias,
        c.derrotas,
        c.partidas
      FROM clasificacion c
      INNER JOIN equipos e ON e.id = c.equipo_id
      WHERE e.eliminado = 0 AND e.estado = 'Activo'
      ORDER BY c.puntos DESC, c.victorias DESC
      LIMIT 5
    `);
    return rows;
  } catch (err) {
    console.error('[Home] getRankingTop5 error:', err);
    return [];
  }
}

// ── Tipos Academy ─────────────────────────────────────────────────────────────
type AcademyPost = RowDataPacket & {
  id: number;
  title: string;
  description: string | null;
  slug: string;
  published_at: Date | null;
};

// ── Nephyx Academy desde BD ───────────────────────────────────────────────────
async function getAcademyPosts(limit = 3): Promise<AcademyPost[]> {
  try {
    const db = getDb();
    const [rows] = await db.query<AcademyPost[]>(
      `SELECT id, title, description, slug, published_at
       FROM content_pages
       WHERE type = 'academy' AND status = 'published'
       ORDER BY published_at DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  } catch (err) {
    console.error('[Home] getAcademyPosts error:', err);
    return [];
  }
}

function formatDate(date: Date | null): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function Home() {
  const [stats, torneos, ranking, academyPosts] = await Promise.all([
    getStats(),
    getTorneosDestacados(6),
    getRankingTop5(),
    getAcademyPosts(3),
  ]);

  const statCards = [
    { value: stats.usuarios, label: 'Jugadores registrados', icon: faUsers  },
    { value: stats.torneos,  label: 'Torneos realizados',    icon: faTrophy },
    { value: stats.activas,  label: 'Competencias activas',  icon: faShield },
    { value: stats.premios,  label: 'Premios entregados',    icon: faMedal  },
  ];

  return (
    <div className="home-page">

      {/* ── HERO ── */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-badge">
            <FontAwesomeIcon icon={faCircle} className="home-live-dot" />
            Season 2026 · League of Legends
          </div>
          <h1 className="home-hero-title">
            La plataforma de<br />
            <span className="home-hero-accent">League of Legends</span><br />
            competitivo en México
          </h1>
          <p className="home-hero-sub">
            Torneos profesionales, clasificatorias en vivo y comunidad activa.
            Compite, crece y domina la Rift con Nephyx Network.
          </p>
          <div className="home-hero-actions">
            <Link href="/auth/register" className="btn btn-primary home-hero-btn">
              Registrarse gratis <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: '0.5rem' }} />
            </Link>
            <Link href="/torneos" className="btn btn-secondary home-hero-btn">
              Ver torneos
            </Link>
          </div>
          <div className="home-hero-social">
            <a href="#" className="home-social-pill" title="Discord"><FontAwesomeIcon icon={faDiscord} /> Discord</a>
            <a href="#" className="home-social-pill" title="Twitch"><FontAwesomeIcon icon={faTwitch} /> Twitch</a>
            <a href="#" className="home-social-pill" title="YouTube"><FontAwesomeIcon icon={faYoutube} /> YouTube</a>
          </div>
        </div>
      </section>

      {/* ── TORNEOS ── */}
      <section className="home-section">
        <div className="home-section-header">
          <div>
            <h2 className="home-section-title">
              <FontAwesomeIcon icon={faTrophy} className="home-section-icon" />
              Torneos destacados
            </h2>
            <p className="home-section-sub">Próximas competencias oficiales Nephyx</p>
          </div>
          <Link href="/torneos" className="home-see-all">
            Ver todos <FontAwesomeIcon icon={faChevronRight} />
          </Link>
        </div>

        {torneos.length === 0 ? (
          <div className="home-tournaments-empty">
            <FontAwesomeIcon icon={faTrophy} />
            <p>No hay torneos disponibles por el momento.</p>
          </div>
        ) : (
          <div className="home-tournaments-grid">
            {torneos.map((t) => (
              <Link key={t.id} href={`/torneos/${t.slug}`} className="home-tournament-card">
                {/* Banner */}
                <div className="home-tournament-banner">
                  <TournamentBanner slug={t.slug} nombre={t.nombre} />
                  <div className="home-tournament-banner-overlay" />
                  <span className={`home-tournament-status home-status-${getStatusType(t.estado)}`}>
                    <FontAwesomeIcon icon={faCircle} className="home-status-dot" />
                    {getStatusLabel(t.estado)}
                  </span>
                </div>

                {/* Cuerpo */}
                <div className="home-tournament-body">
                  <h3 className="home-tournament-name">{t.nombre}</h3>
                  {t.informacion && (
                    <p className="home-tournament-desc">{stripHtml(t.informacion)}</p>
                  )}

                  <div className="home-tournament-prizes">
                    <div className="home-tournament-prize-chip">
                      <div className="home-prize-chip-icon">
                        <FontAwesomeIcon icon={faTrophy} />
                      </div>
                      <div className="home-prize-chip-content">
                        <span className="home-prize-chip-label">Bolsa de premios</span>
                        <span className="home-prize-chip-value">{formatPrize(t.bolsa_premios)}</span>
                      </div>
                    </div>
                    <div className="home-tournament-prize-chip">
                      <div className="home-prize-chip-icon">
                        <FontAwesomeIcon icon={faTicket} />
                      </div>
                      <div className="home-prize-chip-content">
                        <span className="home-prize-chip-label">Entrada</span>
                        <span className="home-prize-chip-value">{formatCosto(t.costo)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="home-tournament-footer">
                    {t.liga_nombre && (
                      <span className="home-tournament-meta-item">
                        <FontAwesomeIcon icon={faLayerGroup} /> {t.liga_nombre}
                      </span>
                    )}
                    <span className="home-tournament-meta-item">
                      <FontAwesomeIcon icon={faCalendarAlt} /> {t.temporada}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── RANKING ── */}
      <RankingTable ranking={ranking} />

      {/* ── STATS ── */}
      <StatsCounter stats={statCards} />

      {/* ── NEPHYX ACADEMY ── */}
      <section className="home-section">
        <div className="home-section-header">
          <div>
            <h2 className="home-section-title">
              <FontAwesomeIcon icon={faBookOpen} className="home-section-icon" />
              Nephyx Academy
            </h2>
            <p className="home-section-sub">Aprende, mejora y domina la Rift</p>
          </div>
          <Link href="/academy" className="home-see-all">
            Ver todo <FontAwesomeIcon icon={faChevronRight} />
          </Link>
        </div>

        {academyPosts.length === 0 ? (
          <div className="home-tournaments-empty">
            <FontAwesomeIcon icon={faBookOpen} />
            <p>Próximamente contenido de Nephyx Academy.</p>
          </div>
        ) : (
          <div className="home-news-grid">
            {academyPosts.map((post) => (
              <article key={post.id} className="home-news-card">
                <div className="home-news-top">
                  <span className="home-news-tag">Academy</span>
                  {post.published_at && (
                    <span className="home-news-date">
                      <FontAwesomeIcon icon={faClock} style={{ marginRight: '0.3rem', fontSize: '0.7rem' }} />
                      {formatDate(post.published_at)}
                    </span>
                  )}
                </div>
                <h3 className="home-news-title">{post.title}</h3>
                {post.description && (
                  <p className="home-news-excerpt">{post.description}</p>
                )}
                <Link href={`/academy/${post.slug}`} className="home-news-link">
                  Leer más <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '0.7rem' }} />
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ── CTA ── */}
      <section className="home-cta">
        <div className="home-cta-inner">
          <FontAwesomeIcon icon={faBolt} className="home-cta-icon" />
          <h2 className="home-cta-title">¿Listo para competir?</h2>
          <p className="home-cta-sub">
            Únete a miles de jugadores en la plataforma de League of Legends competitivo más activa de México.
          </p>
          <div className="home-cta-actions">
            <Link href="/auth/register" className="btn btn-primary home-cta-btn">
              Crear cuenta gratis <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: '0.5rem' }} />
            </Link>
            <Link href="/torneos" className="btn btn-secondary home-cta-btn">
              Explorar torneos
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}