import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrophy, faUsers, faChevronRight, faCalendarAlt, faArrowRight,
  faCircle, faShield, faClock, faTicket, faLayerGroup, faBookOpen,
  faMedal, faUserPlus, faGamepad, faBolt, faStar,
  faChartLine, faLock, faGlobe,
} from '@fortawesome/free-solid-svg-icons';
import { faDiscord, faTwitch, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { getDb } from '@/global/lib/mysql';
import type { RowDataPacket } from 'mysql2';
import TournamentBanner from '@/app/(main)/home/components/TournamentBanner';
import RankingTable, { type RankingRow } from '@/app/(main)/home/components/RankingTable';
import {
  getTorneosDestacados,
  formatPrize,
  formatCosto,
  getStatusType,
  getStatusLabel,
  stripHtml,
} from '@/global/lib/torneos';

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
        c.equipo_id, e.nombre, e.iniciales,
        c.puntos, c.victorias, c.derrotas, c.partidas
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

// ── Academy ───────────────────────────────────────────────────────────────────
type AcademyPost = RowDataPacket & {
  id: number; title: string; description: string | null;
  slug: string; published_at: Date | null;
};

async function getAcademyPosts(limit = 3): Promise<AcademyPost[]> {
  try {
    const db = getDb();
    const [rows] = await db.query<AcademyPost[]>(
      `SELECT id, title, description, slug, published_at
       FROM content_pages
       WHERE type = 'academy' AND status = 'published'
       ORDER BY published_at DESC LIMIT ?`,
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
  return new Date(date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Data estática ─────────────────────────────────────────────────────────────
const features = [
  {
    icon: faTrophy,
    title: 'Torneos oficiales',
    desc: 'Competencias estructuradas con reglas claras, árbitros y premios reales. Desde ligas abiertas hasta circuitos de élite.',
  },
  {
    icon: faChartLine,
    title: 'Clasificatoria en vivo',
    desc: 'Ranking actualizado en tiempo real. Cada victoria suma puntos, cada derrota te enseña. La tabla no miente.',
  },
  {
    icon: faUsers,
    title: 'Comunidad activa',
    desc: 'Miles de jugadores, equipos y organizadores. Encuentra rivales de tu nivel, forma equipo y crece junto a otros.',
  },
  {
    icon: faStar,
    title: 'Nephyx Academy',
    desc: 'Guías, análisis de meta y contenido educativo creado por jugadores competitivos para que subas de nivel más rápido.',
  },
  {
    icon: faGlobe,
    title: 'Alcance regional',
    desc: 'Una organización nacida en México, con jugadores, equipos y competencias que cruzan fronteras. El mejor LoL competitivo, en español.',
  },
  {
    icon: faLock,
    title: 'Resultados verificados',
    desc: 'Cada partido registrado, cada resultado validado. Sin trampa, sin discusión. Transparencia total en cada competencia.',
  },
];

const steps = [
  {
    num: '01',
    icon: faUserPlus,
    title: 'Crea tu cuenta',
    desc: 'Regístrate gratis en menos de 2 minutos. Conecta tu cuenta de League of Legends y configura tu perfil competitivo.',
  },
  {
    num: '02',
    icon: faGamepad,
    title: 'Únete o crea un equipo',
    desc: 'Compite en solitario o forma un equipo. Busca jugadores de tu nivel, coordinen estrategias y entren juntos.',
  },
  {
    num: '03',
    icon: faBolt,
    title: 'Compite y gana',
    desc: 'Inscríbete en torneos, acumula puntos en la clasificatoria y escala hacia los premios más grandes de la temporada.',
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function Home() {
  const [stats, torneos, ranking, academyPosts] = await Promise.all([
    getStats(),
    getTorneosDestacados(6),
    getRankingTop5(),
    getAcademyPosts(3),
  ]);

  return (
    <div className="home-page">

      {/* ══════════════════════════════
          1. HERO + STATS
      ══════════════════════════════ */}
      <section className="home-hero">

        <div className="home-hero-inner">

          <div className="home-hero-content">
            <div className="home-hero-badge">
              <FontAwesomeIcon icon={faCircle} className="home-live-dot" />
              Season 2026 · League of Legends
            </div>
            <h1 className="home-hero-title">
              La plataforma de<br />
              <span className="home-hero-accent">League of Legends</span><br />
              competitivo organizado
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
              <a href="#" className="home-social-pill"><FontAwesomeIcon icon={faDiscord} /> Discord</a>
              <a href="#" className="home-social-pill"><FontAwesomeIcon icon={faTwitch} /> Twitch</a>
              <a href="#" className="home-social-pill"><FontAwesomeIcon icon={faYoutube} /> YouTube</a>
            </div>
          </div>

          <div className="home-hero-stats">
            <div className="home-hero-stat">
              <FontAwesomeIcon icon={faUsers} className="home-hero-stat-icon" />
              <span className="home-hero-stat-value">{stats.usuarios}</span>
              <span className="home-hero-stat-label">Jugadores registrados</span>
            </div>
            <div className="home-hero-stat">
              <FontAwesomeIcon icon={faTrophy} className="home-hero-stat-icon" />
              <span className="home-hero-stat-value">{stats.torneos}</span>
              <span className="home-hero-stat-label">Torneos realizados</span>
            </div>
            <div className="home-hero-stat">
              <FontAwesomeIcon icon={faShield} className="home-hero-stat-icon" />
              <span className="home-hero-stat-value">{stats.activas}</span>
              <span className="home-hero-stat-label">Competencias activas</span>
            </div>
            <div className="home-hero-stat">
              <FontAwesomeIcon icon={faMedal} className="home-hero-stat-icon" />
              <span className="home-hero-stat-value">{stats.premios}</span>
              <span className="home-hero-stat-label">Premios entregados</span>
            </div>
          </div>

        </div>

      </section>

      {/* ══════════════════════════════
          3. ¿QUÉ ES NEPHYX? (ABOUT)
      ══════════════════════════════ */}
      <section className="home-about">
        <div className="home-about-inner">
          <div className="home-about-lead">
            <p className="home-section-label">¿Qué es Nephyx?</p>
            <h2 className="home-about-title">
              La infraestructura del{' '}
              <span className="home-about-accent">League of Legends</span>{' '}
              competitivo
            </h2>
            <p className="home-about-desc">
              Nephyx Network es la plataforma donde los jugadores de League of Legends
              compiten, crecen y se reconocen. Nacida en México, construida para toda
              la comunidad — desde torneos abiertos para cualquier nivel hasta circuitos
              de élite con premios reales, sin importar desde dónde juegas.
            </p>
            <Link href="/nosotros" className="btn btn-secondary home-about-btn">
              Conocer más
            </Link>
          </div>

          <div className="home-features-grid">
            {features.map((f) => (
              <div key={f.title} className="home-feature-card">
                <div className="home-feature-icon">
                  <FontAwesomeIcon icon={f.icon} />
                </div>
                <h3 className="home-feature-title">{f.title}</h3>
                <p className="home-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          4. TORNEOS DESTACADOS
      ══════════════════════════════ */}
      <section className="home-section">
        <div className="home-section-header">
          <div>
            <p className="home-section-label">Competencias</p>
            <h2 className="home-section-title">Torneos destacados</h2>
            <p className="home-section-sub">Próximas competencias oficiales Nephyx</p>
          </div>
          <Link href="/torneos" className="home-see-all">
            Ver todos <FontAwesomeIcon icon={faChevronRight} />
          </Link>
        </div>

        {torneos.length === 0 ? (
          <div className="home-empty">
            <FontAwesomeIcon icon={faTrophy} />
            <p>No hay torneos disponibles por el momento.</p>
          </div>
        ) : (
          <div className="home-tournaments-grid">
            {torneos.map((t) => (
              <Link key={t.id} href={`/torneos/${t.slug}`} className="home-tournament-card">
                <div className="home-tournament-banner">
                  <TournamentBanner slug={t.slug} nombre={t.nombre} />
                  <div className="home-tournament-banner-overlay" />
                  <span className={`home-tournament-status home-status-${getStatusType(t.estado)}`}>
                    <FontAwesomeIcon icon={faCircle} className="home-status-dot" />
                    {getStatusLabel(t.estado)}
                  </span>
                </div>
                <div className="home-tournament-body">
                  <h3 className="home-tournament-name">{t.nombre}</h3>
                  {t.informacion && (
                    <p className="home-tournament-desc">{stripHtml(t.informacion)}</p>
                  )}
                  <div className="home-tournament-prizes">
                    <div className="home-tournament-prize-chip">
                      <div className="home-prize-chip-icon"><FontAwesomeIcon icon={faTrophy} /></div>
                      <div className="home-prize-chip-content">
                        <span className="home-prize-chip-label">Bolsa</span>
                        <span className="home-prize-chip-value">{formatPrize(t.bolsa_premios)}</span>
                      </div>
                    </div>
                    <div className="home-tournament-prize-chip">
                      <div className="home-prize-chip-icon"><FontAwesomeIcon icon={faTicket} /></div>
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

      {/* ══════════════════════════════
          5. CÓMO FUNCIONA
      ══════════════════════════════ */}
      <section className="home-howto">
        <div className="home-howto-inner">
          <div className="home-howto-header">
            <p className="home-section-label">Proceso</p>
            <h2 className="home-section-title">Cómo funciona</h2>
            <p className="home-section-sub">Tres pasos para entrar al circuito competitivo</p>
          </div>
          <div className="home-steps-grid">
            {steps.map((step, i) => (
              <div key={step.num} className="home-step-card">
                <div className="home-step-num">{step.num}</div>
                <div className="home-step-icon">
                  <FontAwesomeIcon icon={step.icon} />
                </div>
                <h3 className="home-step-title">{step.title}</h3>
                <p className="home-step-desc">{step.desc}</p>
                {i < steps.length - 1 && <div className="home-step-connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          6. RANKING
      ══════════════════════════════ */}
      <section className="home-section home-section-alt">
        <div className="home-section-header">
          <div>
            <p className="home-section-label">Clasificatoria 2026</p>
            <h2 className="home-section-title">Ranking de equipos</h2>
            <p className="home-section-sub">Top equipos por puntos y rendimiento</p>
          </div>
          <Link href="/clasificatoria" className="home-see-all">
            Ver ranking completo <FontAwesomeIcon icon={faChevronRight} />
          </Link>
        </div>
        <RankingTable ranking={ranking} />
      </section>

      {/* ══════════════════════════════
          7. ACADEMY
      ══════════════════════════════ */}
      <section className="home-section">
        <div className="home-section-header">
          <div>
            <p className="home-section-label">Contenido</p>
            <h2 className="home-section-title">Nephyx Academy</h2>
            <p className="home-section-sub">Aprende, mejora y domina la Rift</p>
          </div>
          <Link href="/academy" className="home-see-all">
            Ver todo <FontAwesomeIcon icon={faChevronRight} />
          </Link>
        </div>

        {academyPosts.length === 0 ? (
          <div className="home-empty">
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
                  Leer más <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '0.65rem' }} />
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ══════════════════════════════
          8. CTA FINAL
      ══════════════════════════════ */}
      <section className="home-cta">
        <div className="home-cta-inner">
          <p className="home-cta-label">Únete ahora</p>
          <h2 className="home-cta-title">¿Listo para competir?</h2>
          <p className="home-cta-sub">
            Únete a miles de jugadores en la plataforma de League of Legends
            competitivo más organizada de la región.
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