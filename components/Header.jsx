'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faTrophy, faCog, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.user-dropdown-container')) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const userMenuItems = [
    { name: 'Mi Perfil', href: '/perfil', icon: faUser },
    { name: 'Mis Torneos', href: '/mis-torneos', icon: faTrophy },
    { name: 'Configuración', href: '/configuracion', icon: faCog },
    { name: 'Cerrar Sesión', href: '/logout', icon: faRightFromBracket, danger: true },
  ];

  return (
    <>
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-inner">
          {/* Hamburger Menu - Izquierda */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menú"
            className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}
          >
            <div className="hamburger-line line-1" />
            <div className="hamburger-line line-2" />
            <div className="hamburger-line line-3" />
          </button>

          {/* Logo - Centro */}
          <Link href="/" className="logo-link">
            <Image src="/logos/logo.svg" alt="Nephyx logo" width={160} height={160} />
          </Link>

          {/* User Icon con Dropdown - Derecha */}
          <div className="user-dropdown-container" style={{ position: 'relative' }}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              aria-label="Menú de usuario"
              className="user-btn"
            >
              <FontAwesomeIcon icon={faUser} style={{ fontSize: '18px', color: 'var(--txt)' }} />
            </button>

            {/* Dropdown Menu */}
            <div className={`user-dropdown ${userDropdownOpen ? 'open' : ''}`}>
              <div className="user-info">
                <div className="name">Usuario Pro</div>
                <div className="email">usuario@email.com</div>
              </div>

              <div>
                {userMenuItems.map((item, index) => {
                  return (
                    <Link
                      key={index}
                      href={item.href}
                      onClick={() => setUserDropdownOpen(false)}
                      className="menu-item"
                      style={{ color: item.danger ? 'var(--accent)' : undefined }}
                    >
                      <FontAwesomeIcon icon={item.icon} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Overlay */}
      {mobileMenuOpen && <div className="overlay" onClick={() => setMobileMenuOpen(false)} />}
    </>
  );
}