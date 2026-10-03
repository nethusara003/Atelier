import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#FAF7F2',
        parchment: '#F4EFE6',
        beige: '#EDE6DA',
        sand: '#E3D9C8',
        clay: '#A9714B',
        claylight: '#C99E7C',
        terracotta: '#9C4A2F',
        terracottadeep: '#7E3A24',
        charcoal: '#1C1A17',
        smoke: '#4A453E',
        stone: '#8A8177',
        linen: '#D9CFC0',
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.28em',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out both',
        'slow-zoom': 'slowZoom 18s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slowZoom: { from: { transform: 'scale(1)' }, to: { transform: 'scale(1.08)' } },
      },
    },
  },
  plugins: [],
};

export default config;
