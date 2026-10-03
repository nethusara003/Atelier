'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface SavedArtwork {
  slug: string;
  title: string;
  image: string;
  price: string;
}

const KEY = 'atelier-saved-v1';

export function useSavedArtworks() {
  const [saved, setSaved] = useState<SavedArtwork[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setSaved(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
    } catch {
      setSaved([]);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(saved));
    } catch {
      /* storage unavailable */
    }
  }, [saved, ready]);

  const toggle = useCallback((art: SavedArtwork) => {
    setSaved((prev) =>
      prev.some((s) => s.slug === art.slug)
        ? prev.filter((s) => s.slug !== art.slug)
        : [...prev, art]
    );
  }, []);

  const isSaved = useCallback((slug: string) => saved.some((s) => s.slug === slug), [saved]);

  return { saved, toggle, isSaved, ready };
}

export function SavedArtworks() {
  const { saved, toggle } = useSavedArtworks();

  if (saved.length === 0) {
    return (
      <p className="text-smoke">
        You haven’t saved any artworks yet. Tap the bookmark on any artwork to keep it here.
      </p>
    );
  }

  return (
    <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {saved.map((s) => (
        <li key={s.slug} className="group">
          <Link href={`/artwork/${s.slug}`} className="block">
            <div className="relative aspect-[4/5] overflow-hidden bg-beige">
              <Image
                src={s.image}
                alt={s.title}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
            <p className="mt-3 font-serif text-lg leading-tight">{s.title}</p>
            <p className="micro-label mt-1">{s.price}</p>
          </Link>
          <button
            onClick={() => toggle(s)}
            className="link-sweep mt-2 text-xs uppercase tracking-widest2 text-stone hover:text-terracotta"
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}
