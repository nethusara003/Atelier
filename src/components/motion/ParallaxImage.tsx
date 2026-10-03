'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Image with GSAP ScrollTrigger parallax + slow clip reveal.
 * Degrades to a static image when prefers-reduced-motion is set.
 */
export function ParallaxImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  parallax = 0.12,
  priority = false,
  sizes,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  parallax?: number;
  priority?: boolean;
  sizes?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const wrap = wrapRef.current;
    const img = imgRef.current;
    if (!wrap || !img) return;

    const ctx = gsap.context(() => {
      // slow reveal: clip opens as the image enters
      gsap.fromTo(
        wrap,
        { clipPath: 'inset(8% 6% 8% 6%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          ease: 'none',
          scrollTrigger: { trigger: wrap, start: 'top 95%', end: 'top 45%', scrub: 1 },
        }
      );
      // gentle parallax drift
      gsap.fromTo(
        img,
        { yPercent: -parallax * 100 },
        {
          yPercent: parallax * 100,
          ease: 'none',
          scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: 1 },
        }
      );
    }, wrap);

    return () => ctx.revert();
  }, [parallax]);

  return (
    <div ref={wrapRef} className={`relative overflow-hidden ${className}`}>
      <div ref={imgRef} className="relative h-[115%] w-full -mt-[7.5%]">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes ?? '(max-width: 768px) 100vw, 80vw'}
          className={`object-cover ${imgClassName}`}
        />
      </div>
    </div>
  );
}
