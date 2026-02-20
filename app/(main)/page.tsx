import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrophy, faUsers, faChevronRight, faCalendarAlt, faArrowRight,
  faCircle, faMedal, faGlobe, faChartLine, faShield, faClock,
  faTicket, faLayerGroup, faLock, faStar, faHourglassHalf,
} from '@fortawesome/free-solid-svg-icons';
import { faDiscord, faTwitch, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { getDb } from '@/lib/mysql';
import type { RowDataPacket } from 'mysql2';
import TournamentBanner from '@/components/TournamentBanner';
import {
  getTorneosDestacados,
  formatPrize,
  formatCosto,
  stripHtml,
} from '@/lib/torneos';

// Icono por estado
function getStatusIcon(estado: string) {
  const map: Record<string, any> = {
    Activo:     faCircle,
    Abierto:    faStar,
    Preparando: faHourglassHalf,
    Cerrado:    faLock,
  };
  return map[estado] ?? faCircle;
}

// ── Stats (solo se usa en home) ───────────────────────────────────────────────
async function getStats() {
  try {
    const db = getDb();
    const [[usuariosRow], [torneosRow], [activasRow]] = await Promise.all([
      db.query<RowDataPacket[]>(`SELECT COUNT(*) AS total FROM usuarios WHERE estado = 'Activo'`),
      db.query<RowDataPacket[]>(`SELECT COUNT(*) AS total FROM torneos`),
      db.query<RowDataPacket[]>(`SELECT COUNT(*) AS total FROM torneos WHERE estado IN ('Abierto', 'Activo')`),
    ]);
    const fmt = (n: number) =>
      n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M+` :
      n >= 1_000     ? `${Math.floor(n / 1_000)}K+`       : String(n);
    return {
      usuarios: fmt(Number(usuariosRow[0]?.total ?? 0)),
      torneos:  fmt(Number(torneosRow[0]?.total  ?? 0)),
      activas:  String(activasRow[0]?.total ?? 0),
    };
  } catch (err) {
    console.error('[Home] getStats error:', err);
    return { usuarios: '—', torneos: '—', activas: '—' };
  }
}

// ── Datos estáticos ───────────────────────────────────────────────────────────
const teams = [
  { name: 'Phantom Edge', rank: 1, wins: 42, tag: 'PHX' },
  { name: 'Storm Wolves', rank: 2, wins: 38, tag: 'STW' },
  { name: 'Iron Veil',    rank: 3, wins: 35, tag: 'IVL' },
  { name: 'Neon Rush',    rank: 4, wins: 31, tag: 'NRX' },
];

const news = [
  { title: 'Nephyx League Season 2: Las inscripciones están abiertas', excerpt: 'La segunda temporada de nuestra liga más grande ya está disponible. Forma tu equipo y compite por el primer lugar.', date: '18 Feb 2026', tag: 'Torneo' },
  { title: 'Cambios en el formato de torneos para 2026', excerpt: 'Este año implementamos el sistema Double Elimination en todas nuestras competencias principales para mayor emoción.', date: '10 Feb 2026', tag: 'Plataforma' },
  { title: 'Phantom Edge: El equipo revelación de la Season 1', excerpt: 'Conoce al equipo que lo ganó todo en la primera temporada. Una historia de dedicación y estrategia en la Rift.', date: '02 Feb 2026', tag: 'Equipos' },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function Home() {
  const [stats, torneos] = await Promise.all([
    getStats(),
    getTorneosDestacados(6),
  ]);

  const statCards = [
    { value: stats.usuarios, label: 'Jugadores registrados', icon: faUsers },
    { value: stats.torneos,  label: 'Torneos realizados',    icon: faTrophy },
    { value: stats.activas,  label: 'Competencias activas',  icon: faShield },
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
            <Link href="/torneos" className="btn btn-secondary home-hero-btn">Ver torneos</Link>
          </div>
          <div className="home-hero-social">
            <a href="#" className="home-social-pill" title="Discord"><FontAwesomeIcon icon={faDiscord} /> Discord</a>
            <a href="#" className="home-social-pill" title="Twitch"><FontAwesomeIcon icon={faTwitch} /> Twitch</a>
            <a href="#" className="home-social-pill" title="YouTube"><FontAwesomeIcon icon={faYoutube} /> YouTube</a>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="home-stats">
        {statCards.map((s) => (
          <div key={s.label} className="home-stat-card">
            <div className="home-stat-icon"><FontAwesomeIcon icon={s.icon} /></div>
            <div className="home-stat-value">{s.value}</div>
            <div className="home-stat-label">{s.label}</div>
          </div>
        ))}
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
              <Link
                key={t.id}
                href={`/torneos/${t.slug}`}
                className="home-tournament-card"
              >

                {/* Banner */}
                <div className="home-tournament-banner">
                  <TournamentBanner slug={t.slug} nombre={t.nombre} />
                  <div className="home-tournament-banner-overlay" />
                  <span className="home-tournament-status">
                    <FontAwesomeIcon icon={getStatusIcon(t.estado)} className="home-status-dot" />
                    {t.estado}
                  </span>
                </div>

                {/* Cuerpo */}
                <div className="home-tournament-body">
                  <h3 className="home-tournament-name">{t.nombre}</h3>
                  {t.informacion && (
                    <p className="home-tournament-desc">{stripHtml(t.informacion)}</p>
                  )}

                  {/* Chips bolsa / entrada */}
                  <div className="home-tournament-prizes">
                    <div className="home-tournament-prize-chip">
                      <div className="home-prize-chip-icon"><FontAwesomeIcon icon={faTrophy} /></div>
                      <div className="home-prize-chip-content">
                        <span className="home-prize-chip-label">Bolsa de premios</span>
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

                  {/* Footer liga + temporada */}
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
      <section className="home-section home-section-alt">
        <div className="home-section-header">
          <div>
            <h2 className="home-section-title">
              <FontAwesomeIcon icon={faChartLine} className="home-section-icon" />
              Ranking de equipos
            </h2>
            <p className="home-section-sub">Los mejores equipos de la Season 1</p>
          </div>
          <Link href="/clasificatoria" className="home-see-all">
            Ver ranking <FontAwesomeIcon icon={faChevronRight} />
          </Link>
        </div>
        <div className="home-ranking-table">
          <div className="home-ranking-header">
            <span>#</span><span>Equipo</span><span>Victorias</span>
          </div>
          {teams.map((t) => (
            <div key={t.name} className={`home-ranking-row ${t.rank === 1 ? 'home-ranking-first' : ''}`}>
              <span className="home-ranking-pos">
                {t.rank === 1 ? <FontAwesomeIcon icon={faMedal} className="home-medal-gold" /> :
                 t.rank === 2 ? <FontAwesomeIcon icon={faMedal} className="home-medal-silver" /> :
                 t.rank === 3 ? <FontAwesomeIcon icon={faMedal} className="home-medal-bronze" /> : t.rank}
              </span>
              <span className="home-ranking-team">
                <span className="home-team-tag">{t.tag}</span>
                {t.name}
              </span>
              <span className="home-ranking-wins">{t.wins}W</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── NOTICIAS ── */}
      <section className="home-section">
        <div className="home-section-header">
          <div>
            <h2 className="home-section-title">
              <FontAwesomeIcon icon={faGlobe} className="home-section-icon" />
              Últimas noticias
            </h2>
            <p className="home-section-sub">Lo más reciente de Nephyx Network</p>
          </div>
        </div>
        <div className="home-news-grid">
          {news.map((n) => (
            <article key={n.title} className="home-news-card">
              <div className="home-news-top">
                <span className="home-news-tag">{n.tag}</span>
                <span className="home-news-date">
                  <FontAwesomeIcon icon={faClock} style={{ marginRight: '0.3rem', fontSize: '0.7rem' }} />
                  {n.date}
                </span>
              </div>
              <h3 className="home-news-title">{n.title}</h3>
              <p className="home-news-excerpt">{n.excerpt}</p>
              <Link href="#" className="home-news-link">
                Leer más <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '0.7rem' }} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="home-cta">
        <div className="home-cta-inner">
          <FontAwesomeIcon icon={faShield} className="home-cta-icon" />
          <h2 className="home-cta-title">¿Listo para la Rift?</h2>
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