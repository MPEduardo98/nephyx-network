'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  collapsed: boolean;
  mobileOpen: boolean;
  collapse: () => void;
  expand: () => void;
  toggle: () => void;
  toggleMobile: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile]     = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // En móvil, cerrar al redimensionar a desktop
  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);

  const collapse     = () => setCollapsed(true);
  const expand       = () => setCollapsed(false);
  const toggle       = () => setCollapsed(prev => !prev);
  const toggleMobile = () => setMobileOpen(prev => !prev);
  const closeMobile  = () => setMobileOpen(false);

  return (
    <SidebarContext.Provider value={{
      collapsed,
      mobileOpen,
      collapse,
      expand,
      toggle,
      toggleMobile,
      closeMobile,
    }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider');
  return ctx;
}