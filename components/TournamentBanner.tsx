'use client';

import Image from 'next/image';
import { useState } from 'react';

const DEFAULT_BANNER = '/torneos/default.jpg';

interface TournamentBannerProps {
  /** Slug del torneo — busca /torneos/{slug}.webp en /public */
  slug: string;
  /** Texto alternativo para accesibilidad */
  nombre: string;
  /** Clases CSS adicionales para el contenedor (opcional) */
  className?: string;
}

/**
 * Banner de torneo reutilizable.
 * Intenta cargar /torneos/{slug}.webp y cae al default si no existe.
 *
 * Uso:
 *   import TournamentBanner from '@/components/TournamentBanner';
 *   <TournamentBanner slug={torneo.slug} nombre={torneo.nombre} />
 *
 * El componente padre debe tener position: relative y una altura definida
 * para que el fill de Next/Image funcione correctamente.
 */
export default function TournamentBanner({ slug, nombre, className }: TournamentBannerProps) {
  const [src, setSrc] = useState(`/torneos/${slug}.webp`);

  return (
    <Image
      src={src}
      alt={`Banner ${nombre}`}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className={`tournament-banner-img${className ? ` ${className}` : ''}`}
      onError={() => setSrc(DEFAULT_BANNER)}
      unoptimized
      priority={false}
    />
  );
}