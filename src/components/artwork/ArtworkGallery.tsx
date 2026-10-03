'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import type { ArtworkImage } from '@/types/database';

export function ArtworkGallery({
  images,
  title,
}: {
  images: ArtworkImage[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState(false);
  const reduce = useReducedMotion();

  const current = images[active] ?? images[0];

  const close = useCallback(() => {
    setLightbox(false);
    setZoom(false);
  }, []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') setActive((a) => (a + 1) % images.length);
      if (e.key === 'ArrowLeft') setActive((a) => (a - 1 + images.length) % images.length);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightbox, images.length, close]);

  if (!current) return null;

  return (
    <div>
      <div
        className="relative aspect-[4/5] cursor-zoom-in overflow-hidden bg-beige"
        onClick={() => setLightbox(true)}
        role="button"
        tabIndex={0}
        aria-label={`Enlarge image: ${current.alt ?? title}`}
        onKeyDown={(e) => e.key === 'Enter' && setLightbox(true)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            className="absolute inset-0"
            initial={reduce ? false : { opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={current.url}
              alt={current.alt ?? title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute bottom-4 right-4 bg-ivory/90 px-3 py-1.5 text-[11px] uppercase tracking-widest2 text-smoke backdrop-blur-sm">
          Click to enlarge
        </div>
      </div>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3" role="tablist" aria-label="Artwork images">
          {images.map((img, i) => (
            <button
              key={img.id}
              role="tab"
              aria-selected={i === active}
              aria-label={`View image ${i + 1}`}
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden bg-beige transition-all duration-300 ${
                i === active ? 'ring-2 ring-terracotta ring-offset-2 ring-offset-ivory' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Image
                src={img.url}
                alt=""
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-charcoal/95 p-4 md:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${title} — enlarged view`}
            onClick={close}
          >
            <button
              onClick={close}
              aria-label="Close enlarged view"
              className="absolute right-6 top-6 z-10 p-2 text-ivory/80 transition-colors hover:text-ivory"
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
                <path d="M1 1l20 20M21 1L1 21" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setZoom((z) => !z);
              }}
              aria-label={zoom ? 'Zoom out' : 'Zoom in'}
              aria-pressed={zoom}
              className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 border border-ivory/30 px-5 py-2 text-xs uppercase tracking-widest2 text-ivory/90 transition-colors hover:border-ivory hover:text-ivory"
            >
              {zoom ? 'Zoom out' : 'Zoom in'}
            </button>
            <motion.div
              className={`relative ${zoom ? 'h-[92vh] w-[92vw] cursor-zoom-out overflow-auto' : 'h-[80vh] w-auto max-w-[90vw] cursor-zoom-in'}`}
              initial={reduce ? false : { scale: 0.96 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => {
                e.stopPropagation();
                setZoom((z) => !z);
              }}
            >
              <Image
                src={current.url}
                alt={current.alt ?? title}
                fill={!zoom}
                width={zoom ? 1800 : undefined}
                height={zoom ? 2250 : undefined}
                sizes="90vw"
                className={zoom ? 'h-auto w-full object-contain' : 'object-contain'}
                priority
              />
            </motion.div>
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setActive((a) => (a - 1 + images.length) % images.length); }}
                  aria-label="Previous image"
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-ivory/70 transition-colors hover:text-ivory"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M15 4l-8 8 8 8" stroke="currentColor" strokeWidth="1.5"/></svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setActive((a) => (a + 1) % images.length); }}
                  aria-label="Next image"
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-ivory/70 transition-colors hover:text-ivory"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M9 4l8 8-8 8" stroke="currentColor" strokeWidth="1.5"/></svg>
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
