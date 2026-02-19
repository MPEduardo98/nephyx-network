'use client';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrophy,
  faUsers,
  faChevronRight,
  faCalendarAlt,
  faArrowRight,
  faCircle,
  faMedal,
  faGlobe,
  faChartLine,
  faShield,
  faFlag,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import { faDiscord, faTwitch, faYoutube } from '@fortawesome/free-brands-svg-icons';

const stats = [
  { value: '6K+', label: 'Jugadores registrados', icon: faUsers },
  { value: '340+', label: 'Torneos realizados', icon: faTrophy },
  { value: '4', label: 'Competencias activas', icon: faShield },
  { value: '$250K', label: 'En premios repartidos', icon: faMedal },
];

const tournaments = [
  {
    name: 'Nephyx League S2',
    format: '5v5 · Double Elimination',
    date: 'Mar 2026',
    prize: '$5,000 MXN',
    status: 'Inscripciones abiertas',
    statusType: 'open',
    slots: '32/64',
  },
  {
    name: 'Nephyx Circuit',
    format: '5v5 · Round Robin',
    date: 'Abr 2026',
    prize: '$8,000 MXN',
    status: 'Próximamente',
    statusType: 'soon',
    slots: '0/128',
  },
  {
    name: 'Nephyx Clash',
    format: '5v5 · Swiss',
    date: 'May 2026',
    prize: '$3,500 MXN',
    status: 'Próximamente',
    statusType: 'soon',
    slots: '0/32',
  },
];

const teams = [
  { name: 'Phantom Edge', rank: 1, wins: 42, tag: 'PHX' },
  { name: 'Storm Wolves', rank: 2, wins: 38, tag: 'STW' },
  { name: 'Iron Veil', rank: 3, wins: 35, tag: 'IVL' },
  { name: 'Neon Rush', rank: 4, wins: 31, tag: 'NRX' },
];

const news = [
  {
    title: 'Nephyx League Season 2: Las inscripciones están abiertas',
    excerpt: 'La segunda temporada de nuestra liga más grande ya está disponible. Forma tu equipo y compite por el primer lugar.',
    date: '18 Feb 2026',
    tag: 'Torneo',
  },
  {
    title: 'Cambios en el formato de torneos para 2026',
    excerpt: 'Este año implementamos el sistema Double Elimination en todas nuestras competencias principales para mayor emoción.',
    date: '10 Feb 2026',
    tag: 'Plataforma',
  },
  {
    title: 'Phantom Edge: El equipo revelación de la Season 1',
    excerpt: 'Conoce al equipo que lo ganó todo en la primera temporada. Una historia de dedicación y estrategia en la Rift.',
    date: '02 Feb 2026',
    tag: 'Equipos',
  },
];

export default function Home() {
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
            <a href="#" className="home-social-pill" title="Discord">
              <FontAwesomeIcon icon={faDiscord} /> Discord
            </a>
            <a href="#" className="home-social-pill" title="Twitch">
              <FontAwesomeIcon icon={faTwitch} /> Twitch
            </a>
            <a href="#" className="home-social-pill" title="YouTube">
              <FontAwesomeIcon icon={faYoutube} /> YouTube
            </a>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="home-stats">
        {stats.map((s) => (
          <div key={s.label} className="home-stat-card">
            <div className="home-stat-icon">
              <FontAwesomeIcon icon={s.icon} />
            </div>
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

        <div className="home-tournaments-grid">
          {tournaments.map((t) => (
            <div key={t.name} className="home-tournament-card">
              <div className="home-tournament-top">
                <span className={`home-tournament-status home-status-${t.statusType}`}>
                  {t.statusType === 'open' && <FontAwesomeIcon icon={faCircle} className="home-status-dot" />}
                  {t.status}
                </span>
                <span className="home-tournament-slots">{t.slots} slots</span>
              </div>
              <h3 className="home-tournament-name">{t.name}</h3>
              <p className="home-tournament-game">
                <FontAwesomeIcon icon={faFlag} style={{ marginRight: '0.4rem', fontSize: '0.75rem' }} />
                {t.format}
              </p>
              <div className="home-tournament-meta">
                <span>
                  <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '0.35rem' }} />
                  {t.date}
                </span>
                <span className="home-tournament-prize">{t.prize}</span>
              </div>
              <Link href="/torneos" className="btn btn-primary" style={{ marginTop: '1.25rem', fontSize: '0.85rem', padding: '0.6rem 1rem' }}>
                {t.statusType === 'open' ? 'Inscribirse' : 'Más info'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── RANKING ── */}
      <section className="home-section home-section-games">
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
            <span>#</span>
            <span>Equipo</span>
            <span>Victorias</span>
          </div>
          {teams.map((t) => (
            <div key={t.name} className={`home-ranking-row ${t.rank === 1 ? 'home-ranking-first' : ''}`}>
              <span className="home-ranking-pos">
                {t.rank === 1 ? <FontAwesomeIcon icon={faMedal} className="home-medal-gold" /> :
                  t.rank === 2 ? <FontAwesomeIcon icon={faMedal} className="home-medal-silver" /> :
                    t.rank === 3 ? <FontAwesomeIcon icon={faMedal} className="home-medal-bronze" /> :
                      t.rank}
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

      {/* ── CTA FINAL ── */}
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
