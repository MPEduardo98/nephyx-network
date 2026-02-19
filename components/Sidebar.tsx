'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faTrophy,
  faBook,
  faChartBar,
  faBell,
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faRightFromBracket,
  faRightToBracket,
} from '@fortawesome/free-solid-svg-icons';

const navItems = [
  {
    name: 'Perfil',
    href: '/perfil',
    icon: faUser,
    sublinks: [
      { name: 'Mi perfil', href: '/perfil' },
      { name: 'Equipos', href: '/perfil/equipos' },
      { name: 'Partidos', href: '/perfil/partidos' },
      { name: 'Logros', href: '/perfil/logros' },
      { name: 'Premios', href: '/perfil/premios' },
    ],
  },
  { name: 'Torneos', href: '/torneos', icon: faTrophy },
  { name: 'Reglamentos', href: '/reglamentos', icon: faBook },
  { name: 'Clasificatoria', href: '/clasificatoria', icon: faChartBar },
  { name: 'Información', href: '/informacion', icon: faBell },
];

export default function Sidebar() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated';
  const isLoading = status === 'loading';

  const [collapsed, setCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (itemName: string) => {
    setOpenDropdown(openDropdown === itemName ? null : itemName);
  };

  return (
    <>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        {/* Logo and Toggle */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Link href="/">
              <Image src="/logos/icon.png" alt="Nephyx" width={40} height={40} />
            </Link>
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="sidebar-toggle"
            aria-label="Toggle sidebar"
          >
            <FontAwesomeIcon icon={collapsed ? faChevronRight : faChevronLeft} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item, index) => {
            const hasSublinks = item.sublinks && item.sublinks.length > 0;
            const isOpen = openDropdown === item.name;

            return (
              <div key={index} className="sidebar-item-wrapper">
                {hasSublinks ? (
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className="sidebar-link sidebar-dropdown-trigger"
                    title={collapsed ? item.name : ''}
                  >
                    <span className="sidebar-icon">
                      <FontAwesomeIcon icon={item.icon} />
                    </span>
                    {!collapsed && (
                      <>
                        <span className="sidebar-text">{item.name}</span>
                        <FontAwesomeIcon
                          icon={faChevronDown}
                          className={`sidebar-chevron ${isOpen ? 'open' : ''}`}
                        />
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className="sidebar-link"
                    title={collapsed ? item.name : ''}
                  >
                    <span className="sidebar-icon">
                      <FontAwesomeIcon icon={item.icon} />
                    </span>
                    {!collapsed && (
                      <>
                        <span className="sidebar-text">{item.name}</span>
                        <FontAwesomeIcon icon={faChevronDown} className="sidebar-chevron" />
                      </>
                    )}
                  </Link>
                )}

                {hasSublinks && !collapsed && (
                  <div className={`sidebar-dropdown ${isOpen ? 'open' : ''}`}>
                    {item.sublinks!.map((sublink, subIndex) => (
                      <Link key={subIndex} href={sublink.href} className="sidebar-sublink">
                        {sublink.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="sidebar-bottom">
          {isLoading ? (
            // Skeleton mientras carga la sesión
            <div className="user-profile" style={{ opacity: 0.4 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--borders)' }} />
            </div>
          ) : isLoggedIn ? (
            // ── SESIÓN ACTIVA ──────────────────────────────────────
            <div className="user-profile">
              <Image
                src="/logos/icon.png"
                alt={session.user.name ?? 'avatar'}
                width={collapsed ? 24 : 40}
                height={collapsed ? 24 : 40}
                className="user-avatar"
              />
              {!collapsed && (
                <div className="user-info">
                  <div className="user-name">{session.user.name}</div>
                  <div className="user-group">{session.user.grupo}</div>
                </div>
              )}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="logout-btn"
                title="Cerrar Sesión"
              >
                <FontAwesomeIcon icon={faRightFromBracket} />
              </button>
            </div>
          ) : (
            // ── SIN SESIÓN ─────────────────────────────────────────
            <Link
              href="/auth/login"
              className="sidebar-link"
              title={collapsed ? 'Iniciar Sesión' : ''}
              style={{ marginTop: 'auto' }}
            >
              <span className="sidebar-icon">
                <FontAwesomeIcon icon={faRightToBracket} />
              </span>
              {!collapsed && <span className="sidebar-text">Iniciar Sesión</span>}
            </Link>
          )}
        </div>
      </aside>

      <div className={`sidebar-spacer ${collapsed ? 'collapsed' : ''}`} />
    </>
  );
}