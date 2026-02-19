'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faTrophy,
  faCog,
  faRightFromBracket,
  faRightToBracket,
  faUserPlus,
} from '@fortawesome/free-solid-svg-icons';

export default function Header() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated';
  const isLoading = status === 'loading';

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.user-dropdown-container')) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const authMenuItems = [
    { name: 'Mi Perfil', href: '/perfil', icon: faUser },
    { name: 'Mis Torneos', href: '/mis-torneos', icon: faTrophy },
    { name: 'Configuración', href: '/configuracion', icon: faCog },
  ];

  return (
    <>
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-inner">
          {/* Hamburger Menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menú"
            className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}
          >
            <div className="hamburger-line line-1" />
            <div className="hamburger-line line-2" />
            <div className="hamburger-line line-3" />
          </button>

          {/* Logo */}
          <Link href="/" className="logo-link">
            <Image src="/logos/logo.svg" alt="Nephyx logo" width={160} height={160} />
          </Link>

          {/* User Dropdown */}
          <div className="user-dropdown-container" style={{ position: 'relative' }}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              aria-label="Menú de usuario"
              className="user-btn"
            >
              <FontAwesomeIcon icon={faUser} style={{ fontSize: '18px', color: 'var(--txt)' }} />
            </button>

            <div className={`user-dropdown ${userDropdownOpen ? 'open' : ''}`}>
              {isLoading ? (
                // Skeleton mientras carga
                <div className="user-info">
                  <div className="name" style={{ opacity: 0.4 }}>Cargando...</div>
                </div>
              ) : isLoggedIn ? (
                // ── SESIÓN ACTIVA ──────────────────────────────────
                <>
                  <div className="user-info">
                    <div className="name">{session.user.name}</div>
                    <div className="email">{session.user.email}</div>
                  </div>

                  {authMenuItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setUserDropdownOpen(false)}
                      className="menu-item"
                    >
                      <FontAwesomeIcon icon={item.icon} />
                      {item.name}
                    </Link>
                  ))}

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="menu-item"
                    style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--accent)', textAlign: 'left' }}
                  >
                    <FontAwesomeIcon icon={faRightFromBracket} />
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                // ── SIN SESIÓN ─────────────────────────────────────
                <>
                  <div className="user-info">
                    <div className="name">Bienvenido</div>
                    <div className="email">Inicia sesión para continuar</div>
                  </div>

                  <Link
                    href="/auth/login"
                    onClick={() => setUserDropdownOpen(false)}
                    className="menu-item"
                  >
                    <FontAwesomeIcon icon={faRightToBracket} />
                    Iniciar Sesión
                  </Link>

                  <Link
                    href="/auth/register"
                    onClick={() => setUserDropdownOpen(false)}
                    className="menu-item"
                  >
                    <FontAwesomeIcon icon={faUserPlus} />
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {mobileMenuOpen && <div className="overlay" onClick={() => setMobileMenuOpen(false)} />}
    </>
  );
}