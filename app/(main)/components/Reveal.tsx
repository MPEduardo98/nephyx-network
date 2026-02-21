'use client';

import React, { useEffect, useRef, useState, ReactNode, CSSProperties, ElementType } from 'react';

type RevealVariant =
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'fade'
  | 'scale-up'
  | 'slide-left'
  | 'slide-right';

interface RevealProps {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
}

export default function Reveal({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 700,
  threshold = 0.1,
  rootMargin = '0px 0px -50px 0px',
  className = '',
  style = {},
  as: Tag = 'div',
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const baseStyle: CSSProperties = {
    transitionProperty: 'opacity, transform',
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    transitionDelay: visible ? `${delay}ms` : '0ms',
    willChange: 'opacity, transform',
    ...style,
  };

  const hiddenStyles: Record<RevealVariant, CSSProperties> = {
    'fade-up':     { opacity: 0, transform: 'translateY(32px)' },
    'fade-down':   { opacity: 0, transform: 'translateY(-32px)' },
    'fade-left':   { opacity: 0, transform: 'translateX(32px)' },
    'fade-right':  { opacity: 0, transform: 'translateX(-32px)' },
    'fade':        { opacity: 0 },
    'scale-up':    { opacity: 0, transform: 'scale(0.94)' },
    'slide-left':  { opacity: 0, transform: 'translateX(64px)' },
    'slide-right': { opacity: 0, transform: 'translateX(-64px)' },
  };

  const visibleStyle: CSSProperties = { opacity: 1, transform: 'none' };

  const animStyle = visible
    ? { ...baseStyle, ...visibleStyle }
    : { ...baseStyle, ...hiddenStyles[variant] };

  return (
    <Tag ref={ref} className={className} style={animStyle}>
      {children}
    </Tag>
  );
}