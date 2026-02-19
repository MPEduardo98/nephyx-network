'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faTrophy, faBook, faRankingStar, faCircleInfo,
  faChevronLeft, faChevronRight, faChevronDown,
  faRightFromBracket, faRightToBracket,
  faIdBadge, faPeopleGroup, faGamepad, faMedal, faGift,
  faList, faCircleDot,
  faGavel, faCrown, faRoute, faBolt, faFire,
  faCalendar,
  faBuilding, faEnvelope, faCircleQuestion,
  faSun, faScrewdriverWrench,
} from '@fortawesome/free-solid-svg-icons';

const navItems = [
  {
    name: 'Perfil',
    icon: faUser,
    authOnly: true,
    sublinks: [
      { name: 'Mi Perfil',  href: '/perfil',           icon: faIdBadge     },
      { name: 'Equipos',   href: '/perfil/equipos',    icon: faPeopleGroup },
      { name: 'Partidos',  href: '/perfil/partidos',   icon: faGamepad     },
      { name: 'Logros',    href: '/perfil/logros',     icon: faTrophy      },
      { name: 'Premios',   href: '/perfil/premios',    icon: faMedal       },
    ],
  },
  {
    name: 'Torneos',
    icon: faTrophy,
    sublinks: [
      { name: 'Ver todos los torneos', href: '/torneos',          icon: faList      },
      { name: 'Torneo Activo',         href: '/torneos/activo-1', icon: faCircleDot },
    ],
  },
  {
    name: 'Reglamentos',
    icon: faBook,
    sublinks: [
      { name: 'Reglamento General',   href: '/reglamentos/general',      icon: faGavel },
      { name: 'Nephyx League',        href: '/reglamentos/league',       icon: faCrown },
      { name: 'Nephyx Circuit',       href: '/reglamentos/circuit',      icon: faRoute },
      { name: 'Nephyx Clash',         href: '/reglamentos/clash',        icon: faBolt  },
      { name: 'Nephyx Pre-Temporada', href: '/reglamentos/pretemporada', icon: faFire  },
    ],
  },
  {
    name: 'Clasificatoria',
    icon: faRankingStar,
    sublinks: [
      { name: 'Season 2026', href: '/clasificatoria?year=2026', icon: faCalendar },
    ],
  },
  {
    name: 'Información',
    icon: faCircleInfo,
    sublinks: [
      { name: 'Nosotros', href: '/informacion/nosotros', icon: faBuilding       },
      { name: 'Contacto', href: '/informacion/contacto', icon: faEnvelope       },
      { name: 'FAQ',      href: '/informacion/faq',      icon: faCircleQuestion },
    ],
  },
];

export default function Sidebar() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated';
  const isAdmin    = session?.user?.grupo === 'admin';
  const pathname   = usePathname();

  const [collapsed,    setCollapsed]    = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) =>
    setOpenDropdown(openDropdown === name ? null : name);

  // Inicial del usuario para el avatar fallback
  const userInitial = session?.user?.name?.[0]?.toUpperCase() ?? 'U';

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="sidebar-header">
        <Link href="/" className="sidebar-logo-link">
          <Image src="/logos/icon.png" alt="Nephyx" width={42} height={42} />
        </Link>

        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expandir' : 'Colapsar'}
        >
          <FontAwesomeIcon icon={collapsed ? faChevronRight : faChevronLeft} />
        </button>
      </div>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="sidebar-nav">

        {/* Primary */}
        <ul className="nav-list primary-nav">
          {navItems.map((item, index) => {
            if (item.authOnly && !isLoggedIn) return null;

            const isOpen      = openDropdown === item.name;
            const hasSublinks = !!item.sublinks?.length;
            const dropdownHeight = hasSublinks
              ? item.sublinks!.length * 46 + 16
              : 0;

            return (
              <li
                key={index}
                className={`nav-item dropdown-container ${isOpen ? 'open' : ''}`}
              >
                <button
                  className="nav-link dropdown-toggle"
                  onClick={() => toggleDropdown(item.name)}
                  title={collapsed ? item.name : ''}
                >
                  <FontAwesomeIcon icon={item.icon} />
                  <span className="nav-label">{item.name}</span>
                  <FontAwesomeIcon icon={faChevronDown} className="dropdown-icon" />
                </button>

                {hasSublinks && (
                  <ul
                    className="dropdown-menu"
                    style={{
                      height: isOpen && !collapsed ? `${dropdownHeight}px` : undefined,
                    }}
                  >
                    <li className="nav-item">
                      <span className="nav-link dropdown-title">{item.name}</span>
                    </li>
                    {item.sublinks!.map((sub, si) => (
                      <li key={si} className="nav-item">
                        <Link
                          href={sub.href}
                          className={`nav-link dropdown-link ${pathname === sub.href ? 'active' : ''}`}
                        >
                          <FontAwesomeIcon icon={sub.icon} />
                          <span>{sub.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        {/* Secondary */}
        <ul className="nav-list secondary-nav">
          {/* Theme toggle */}
          <li className="nav-item">
            <div className="nav-link" style={{ cursor: 'default' }}>
              <FontAwesomeIcon icon={faSun} />
              <span className="nav-label">Modo claro</span>
              <label className="theme-toggle__switch">
                <input type="checkbox" className="theme-toggle__input" />
                <span className="theme-toggle__slider" />
              </label>
            </div>
          </li>

          {/* Admin panel */}
          {isAdmin && (
            <li className="nav-item">
              <Link href="/admin/dashboard" className="nav-link">
                <FontAwesomeIcon icon={faScrewdriverWrench} />
                <span className="nav-label">Nephyx Panel</span>
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* ── Footer — usuario ─────────────────────────────────── */}
      <div className="sidebar-footer">
        {isLoggedIn ? (
          <div className="sidebar-user-card">
            {/* Avatar */}
            <div className="sidebar-user-avatar">
              <div className="sidebar-avatar-fallback">
                {userInitial}
              </div>
              <span className="sidebar-user-online" />
            </div>

            {/* Info */}
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{session.user.name}</span>
              <span className="sidebar-user-role">{session.user.grupo}</span>
            </div>

            {/* Logout */}
            <button
              className="sidebar-logout-btn"
              onClick={() => signOut({ callbackUrl: '/' })}
              title="Cerrar Sesión"
            >
              <FontAwesomeIcon icon={faRightFromBracket} />
            </button>
          </div>
        ) : (
          <Link href="/auth/login" className="sidebar-login-footer">
            <FontAwesomeIcon icon={faRightToBracket} />
            <span>Iniciar Sesión</span>
          </Link>
        )}
      </div>
    </aside>
  );
}