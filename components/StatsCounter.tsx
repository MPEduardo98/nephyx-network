'use client';

import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface StatCard {
  value: string;
  label: string;
  icon: IconDefinition;
}

interface Props {
  stats: StatCard[];
}

// Parsea "$1.5M", "$128", "12K+", "3" → { prefix, num, suffix }
function parseValue(raw: string): { prefix: string; num: number; suffix: string } {
  // Maneja prefijo $ opcional, número, y sufijo KM+
  const match = raw.match(/^(\$?)([\d.]+)([KMk+]*)$/);
  if (!match) return { prefix: '', num: 0, suffix: raw };
  return {
    prefix: match[1] ?? '',
    num:    parseFloat(match[2]),
    suffix: match[3] ?? '',
  };
}

function useCountUp(target: number, duration = 1800, active: boolean) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCurrent(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);

  return current;
}

function StatItem({ value, label, icon }: StatCard) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const { prefix, num, suffix } = parseValue(value);
  const count = useCountUp(num, 1800, visible);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Reconstruye el display: "$12K", "12K+", "3", etc.
  const display = num >= 1000
    ? `${prefix}${Math.floor(count / 1000)}K${suffix.includes('+') ? '+' : ''}`
    : `${prefix}${count}${suffix}`;

  return (
    <div ref={ref} className={`home-stat-card${visible ? ' stat-visible' : ''}`}>
      <div className="home-stat-icon">
        <FontAwesomeIcon icon={icon} />
      </div>
      <div className="home-stat-value stat-count">{display}</div>
      <div className="home-stat-label">{label}</div>
    </div>
  );
}

export default function StatsCounter({ stats }: Props) {
  return (
    <section className="home-stats home-stats-below">
      {stats.map((s) => (
        <StatItem key={s.label} {...s} />
      ))}
    </section>
  );
}