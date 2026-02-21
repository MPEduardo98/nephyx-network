'use client';

import Image from 'next/image';
import '@/global/styles/loader.css';

export default function Loader() {
  return (
    <div className="loader-overlay">
      <div className="loader-container">
        <div className="loader-ring-outer" />
        <div className="loader-ring-middle" />
        <div className="loader-icon-wrapper">
          <Image
            src="/logos/icon.png"
            alt="Nephyx"
            width={32}
            height={32}
            className="loader-icon"
            priority
          />
        </div>
        <div className="loader-orbit">
          <div className="loader-orbit-dot" />
        </div>
      </div>
    </div>
  );
}