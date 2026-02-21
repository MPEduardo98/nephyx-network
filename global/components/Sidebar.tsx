'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faTrophy, faBook, faRankingStar, faCircleInfo,
  faChevronDown,
  faRightFromBracket, faRightToBracket,
  faIdBadge, faPeopleGroup, faGamepad,
  faList, faCircleDot,
  faGavel, faCrown, faRoute, faBolt, faFire,
  faCalendar,
  faBuilding, faEnvelope, faCircleQuestion,
  faSun, faScrewdriverWrench,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import { useSidebar } from '@/global/context/SidebarContext';
import { useTheme } from '@/global/context/ThemeContext';

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
      { name: 'Ver todos',     href: '/torneos',          icon: faList      },
      { name: 'Torneo Activo', href: '/torneos/activo-1', icon: faCircleDot },
    ],
  },
  {
    name: 'Reglamentos',
    icon: faBook,
    sublinks: [
      { name: 'General',       href: '/reglamentos/general',      icon: faGavel },
      { name: 'League',        href: '/reglamentos/league',       icon: faCrown },
      { name: 'Circuit',       href: '/reglamentos/circuit',      icon: faRoute },
      { name: 'Clash',         href: '/reglamentos/clash',        icon: faBolt  },
      { name: 'Pre-Temporada', href: '/reglamentos/pretemporada', icon: faFire  },
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

  const { collapsed, collapse, expand, toggle, mobileOpen, closeMobile } = useSidebar();
  const { theme, toggleTheme } = useTheme();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    if (collapsed) { expand(); return; }
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const userInitial = session?.user?.name?.[0]?.toUpperCase() ?? 'U';

  return (
    <>
      {/* Overlay móvil */}
      <div
        className={`sidebar-overlay ${mobileOpen ? 'active' : ''}`}
        onClick={closeMobile}
        aria-hidden="true"
      />

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>

        {/* ── Header ── */}
        <div className="sb-header">
          <button className="sb-logo-btn" onClick={toggle} aria-label="Toggle sidebar">
            <Image src="/logos/icon.png" alt="Nephyx" width={36} height={36} />
          </button>
          {!collapsed && (
            <button
              className="sb-collapse-btn"
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth <= 768) {
                  closeMobile();
                } else {
                  collapse();
                }
              }}
              aria-label="Cerrar"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
          )}
        </div>

        {/* ── Nav ── */}
        <nav className="sb-nav">
          <ul className="sb-nav-list">
            {navItems.map((item, i) => {
              if (item.authOnly && !isLoggedIn) return null;

              const isOpen      = openDropdown === item.name;
              const hasSublinks = !!item.sublinks?.length;
              const dropH       = hasSublinks ? item.sublinks!.length * 52 + 4 : 0;

              return (
                <li key={i} className={`sb-item ${isOpen ? 'open' : ''}`}>
                  <button
                    className="sb-link"
                    onClick={() => toggleDropdown(item.name)}
                    title={collapsed ? item.name : ''}
                  >
                    <span className="sb-icon">
                      <FontAwesomeIcon icon={item.icon} />
                    </span>
                    <span className="sb-label">{item.name}</span>
                    {hasSublinks && !collapsed && (
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        className={`sb-chevron ${isOpen ? 'open' : ''}`}
                      />
                    )}
                  </button>

                  {hasSublinks && (
                    <ul
                      className="sb-dropdown"
                      style={{ height: isOpen && !collapsed ? `${dropH}px` : '0px' }}
                    >
                      {item.sublinks!.map((sub, si) => (
                        <li key={si}>
                          <Link
                            href={sub.href}
                            className={`sb-sublink ${pathname === sub.href ? 'active' : ''}`}
                            onClick={closeMobile}
                          >
                            <span className="sb-subicon">
                              <FontAwesomeIcon icon={sub.icon} />
                            </span>
                            <span className="sb-sublabel">{sub.name}</span>
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

        {/* ── Footer ── */}
        <div className="sb-footer">

          {/* Toggle de tema */}
          <div className="sb-footer-row" onClick={toggleTheme}>
            <span className="sb-icon">
              <FontAwesomeIcon icon={faSun} />
            </span>
            <span className="sb-label">Modo claro</span>
            <label
              className="sb-toggle"
              aria-label="Cambiar tema"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                className="sb-toggle-input"
                checked={theme === 'light'}
                onChange={toggleTheme}
              />
              <span className="sb-toggle-slider" />
            </label>
          </div>

          {/* Nephyx Panel (admin) */}
          {isAdmin && (
            <Link href="/admin/dashboard" className="sb-footer-row" title="Nephyx Panel">
              <span className="sb-icon">
                <FontAwesomeIcon icon={faScrewdriverWrench} />
              </span>
              <span className="sb-label">Nephyx Panel</span>
            </Link>
          )}

          <div className="sb-divider" />

          {/* Usuario / Login */}
          {isLoggedIn ? (
            <div className="sb-footer-row sb-user-row">
              <div className="sb-avatar">{userInitial}</div>
              <div className="sb-user-info">
                <span className="sb-username">{session?.user?.name}</span>
                <span className="sb-user-role">{session?.user?.grupo}</span>
              </div>
              <button
                className="sb-logout-btn"
                onClick={() => signOut({ callbackUrl: '/' })}
                title="Cerrar sesión"
              >
                <FontAwesomeIcon icon={faRightFromBracket} />
              </button>
            </div>
          ) : (
            <Link href="/auth/login" className="sb-footer-row" onClick={closeMobile}>
              <span className="sb-icon">
                <FontAwesomeIcon icon={faRightToBracket} />
              </span>
              <span className="sb-label">Iniciar sesión</span>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}