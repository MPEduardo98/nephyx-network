'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
} from '@fortawesome/free-solid-svg-icons';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  // Datos del usuario (ejemplo - en una app real vendrían de una sesión/context)
  const user = {
    name: 'Juan Pérez',
    group: 'Administrador',
    avatar: '/logos/logo.svg',
  };

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

  const toggleDropdown = (itemName) => {
    setOpenDropdown(openDropdown === itemName ? null : itemName);
  };

  return (
    <>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        {/* Logo and Toggle Section */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Link href="/">
              <Image src="/logos/icon.png" alt="Nephyx" width={40} height={40} />
            </Link>
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="sidebar-toggle"
            aria-label="Toggle sidebar"
          >
            <FontAwesomeIcon icon={collapsed ? faChevronRight : faChevronLeft} />
          </button>
        </div>

        {/* Navigation Items */}
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

                {/* Dropdown Menu */}
                {hasSublinks && !collapsed && (
                  <div className={`sidebar-dropdown ${isOpen ? 'open' : ''}`}>
                    {item.sublinks.map((sublink, subIndex) => (
                      <Link
                        key={subIndex}
                        href={sublink.href}
                        className="sidebar-sublink"
                      >
                        {sublink.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom Section - User Profile */}
        <div className="sidebar-bottom">
          <div className="user-profile">
            <Image
              src={user.avatar}
              alt={user.name}
              width={collapsed ? 24 : 40}
              height={collapsed ? 24 : 40}
              className="user-avatar"
            />
            {!collapsed && (
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-group">{user.group}</div>
              </div>
            )}
            <Link href="/logout" className="logout-btn" title="Cerrar Sesión">
              <FontAwesomeIcon icon={faRightFromBracket} />
            </Link>
          </div>
        </div>
      </aside>

      {/* Content spacer - takes space based on sidebar state */}
      <div className={`sidebar-spacer ${collapsed ? 'collapsed' : ''}`} />
    </>
  );
}
