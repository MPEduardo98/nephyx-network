'use client';

import Image from 'next/image';
import { useState } from 'react';

interface TeamLogoProps {
  iniciales: string;
  nombre: string;
  size?: number;
  className?: string;
}

/**
 * Muestra el logo de un equipo desde /equipos/logos/{INICIALES}.webp
 * Si no existe, muestra un fallback con las iniciales del equipo.
 */
export default function TeamLogo({
  iniciales,
  nombre,
  size = 32,
  className = '',
}: TeamLogoProps) {
  const [error, setError] = useState(false);
  const src = `/equipos/logos/${iniciales.toUpperCase()}.webp`;

  if (error) {
    return (
      <span
        className={`team-logo-fallback ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'var(--color-primary, #6366f1)',
          color: '#fff',
          fontWeight: 700,
          fontSize: size * 0.38,
          flexShrink: 0,
          userSelect: 'none',
        }}
        title={nombre}
      >
        {iniciales.slice(0, 3).toUpperCase()}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={`Logo ${nombre}`}
      width={size}
      height={size}
      className={className}
      style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      onError={() => setError(true)}
      unoptimized
    />
  );
}