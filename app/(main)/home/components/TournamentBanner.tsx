'use client';

import Image from 'next/image';
import { useState } from 'react';

const DEFAULT_BANNER = '/torneos/default.jpg';

interface TournamentBannerProps {
  slug: string;
  nombre: string;
  className?: string;
}

export default function TournamentBanner({ slug, nombre, className }: TournamentBannerProps) {
  const [src, setSrc] = useState(`/torneos/${slug}.webp`);

  return (
    <Image
      src={src}
      alt={`Banner ${nombre}`}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className={`home-tournament-banner-img${className ? ` ${className}` : ''}`}
      onError={() => setSrc(DEFAULT_BANNER)}
      unoptimized
    />
  );
}