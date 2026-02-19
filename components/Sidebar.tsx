'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faTrophy, faBook, faRankingStar, faCircleInfo,
  faChevronLeft, faChevronDown,
  faRightFromBracket, faRightToBracket,
  faIdBadge, faPeopleGroup, faGamepad, faMedal,
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

  const [collapsed, setCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const expand = () => { if (collapsed) setCollapsed(false); };

  const toggleDropdown = (name: string) =>
    setOpenDropdown(openDropdown === name ? null : name);

  const collapse = () => {
    setCollapsed(true);
    setOpenDropdown(null);
  };

  const userInitial = session?.user?.name?.[0]?.toUpperCase() ?? 'U';

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>

      {/* ── Header: logo abre | flecha cierra ───────────────── */}
      <div className="sidebar-header">
        {/* Col 1: logo — abre el sidebar */}
        <div className="sidebar-col-icons">
          <button
            className="sidebar-logo-btn"
            onClick={() => collapsed ? expand() : collapse()}
            aria-label={collapsed ? 'Expandir' : 'Colapsar'}
          >
            <Image src="/logos/icon.png" alt="Nephyx" width={42} height={42} />
          </button>
        </div>

        {/* Col 2: flecha — solo visible en expandido, cierra el sidebar */}
        <div className="sidebar-col-content sidebar-header-content">
          <button
            className="sidebar-close-btn"
            onClick={() => collapse()}
            aria-label="Cerrar sidebar"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
        </div>
      </div>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="sidebar-nav">
        <ul className="nav-list primary-nav">
          {navItems.map((item, index) => {
            if (item.authOnly && !isLoggedIn) return null;

            const isOpen         = openDropdown === item.name;
            const hasSublinks    = !!item.sublinks?.length;
            const dropdownHeight = hasSublinks ? item.sublinks!.length * 52 + 8 : 0;

            return (
              <li key={index} className={`nav-item ${isOpen ? 'open' : ''}`}>
                <button
                  className="nav-link"
                  onClick={() => collapsed ? expand() : toggleDropdown(item.name)}
                  title={collapsed ? item.name : ''}
                >
                  <span className="sidebar-col-icons">
                    <FontAwesomeIcon icon={item.icon} />
                  </span>
                  <span className="sidebar-col-content nav-link-content">
                    <span className="nav-label">{item.name}</span>
                    {hasSublinks && (
                      <FontAwesomeIcon icon={faChevronDown} className="dropdown-icon" />
                    )}
                  </span>
                </button>

                {/* Sublinks — solo cuando expandido */}
                {hasSublinks && !collapsed && (
                  <ul
                    className="dropdown-menu"
                    style={{ height: isOpen ? `${dropdownHeight}px` : '0px' }}
                  >
                    {item.sublinks!.map((sub, si) => (
                      <li key={si} className="nav-item">
                        <Link
                          href={sub.href}
                          className={`nav-link dropdown-link ${pathname === sub.href ? 'active' : ''}`}
                        >
                          <span className="sidebar-col-icons">
                            <FontAwesomeIcon icon={sub.icon} />
                          </span>
                          <span className="sidebar-col-content">
                            <span className="nav-label">{sub.name}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Footer ──────────────────────────────────────────── */}
      <div className="sidebar-footer">

        {/* Modo claro — el icono NO abre el sidebar */}
        <div className="sidebar-footer-row">
          <span className="sidebar-col-icons">
            <FontAwesomeIcon icon={faSun} />
          </span>
          <span className="sidebar-col-content sidebar-footer-content">
            <span className="sidebar-footer-label">Modo claro</span>
            <label className="theme-toggle__switch">
              <input type="checkbox" className="theme-toggle__input" />
              <span className="theme-toggle__slider" />
            </label>
          </span>
        </div>

        {/* Nephyx Panel */}
        {isAdmin && (
          collapsed ? (
            <button className="sidebar-footer-row" onClick={expand}>
              <span className="sidebar-col-icons">
                <FontAwesomeIcon icon={faScrewdriverWrench} />
              </span>
              <span className="sidebar-col-content">
                <span className="sidebar-footer-label">Nephyx Panel</span>
              </span>
            </button>
          ) : (
            <Link href="/admin/dashboard" className="sidebar-footer-row">
              <span className="sidebar-col-icons">
                <FontAwesomeIcon icon={faScrewdriverWrench} />
              </span>
              <span className="sidebar-col-content">
                <span className="sidebar-footer-label">Nephyx Panel</span>
              </span>
            </Link>
          )
        )}

        {/* Divider */}
        <div className="sidebar-footer-divider" />

        {/* Usuario / Login */}
        {isLoggedIn ? (
          collapsed ? (
            <button className="sidebar-footer-row sidebar-user-row" onClick={expand}>
              <span className="sidebar-col-icons">
                <span className="sidebar-user-avatar">
                  <span className="sidebar-avatar-fallback">{userInitial}</span>
                  <span className="sidebar-user-online" />
                </span>
              </span>
              <span className="sidebar-col-content sidebar-user-content">
                <span className="sidebar-user-info">
                  <span className="sidebar-user-name">{session.user.name}</span>
                  <span className="sidebar-user-role">{session.user.grupo}</span>
                </span>
                <button
                  className="sidebar-logout-btn"
                  onClick={(e) => { e.stopPropagation(); signOut({ callbackUrl: '/' }); }}
                  title="Cerrar Sesión"
                >
                  <FontAwesomeIcon icon={faRightFromBracket} />
                </button>
              </span>
            </button>
          ) : (
            <div className="sidebar-footer-row sidebar-user-row">
              <span className="sidebar-col-icons">
                <span className="sidebar-user-avatar">
                  <span className="sidebar-avatar-fallback">{userInitial}</span>
                  <span className="sidebar-user-online" />
                </span>
              </span>
              <span className="sidebar-col-content sidebar-user-content">
                <span className="sidebar-user-info">
                  <span className="sidebar-user-name">{session.user.name}</span>
                  <span className="sidebar-user-role">{session.user.grupo}</span>
                </span>
                <button
                  className="sidebar-logout-btn"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  title="Cerrar Sesión"
                >
                  <FontAwesomeIcon icon={faRightFromBracket} />
                </button>
              </span>
            </div>
          )
        ) : (
          collapsed ? (
            <button className="sidebar-footer-row" onClick={expand}>
              <span className="sidebar-col-icons">
                <FontAwesomeIcon icon={faRightToBracket} />
              </span>
              <span className="sidebar-col-content">
                <span className="sidebar-login-label">Iniciar Sesión</span>
              </span>
            </button>
          ) : (
            <Link href="/auth/login" className="sidebar-footer-row">
              <span className="sidebar-col-icons">
                <FontAwesomeIcon icon={faRightToBracket} />
              </span>
              <span className="sidebar-col-content">
                <span className="sidebar-login-label">Iniciar Sesión</span>
              </span>
            </Link>
          )
        )}
      </div>
    </aside>
  );
}