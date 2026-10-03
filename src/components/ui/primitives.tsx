export function Badge({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'clay' | 'terracotta' | 'dark' | 'success';
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: 'bg-beige text-smoke',
    clay: 'bg-clay/15 text-clay',
    terracotta: 'bg-terracotta/10 text-terracotta',
    dark: 'bg-charcoal text-ivory',
    success: 'bg-green-900/10 text-green-900',
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-[11px] font-medium uppercase tracking-widest2 ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Spinner({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg className={`animate-spin text-terracotta ${className}`} viewBox="0 0 24 24" fill="none" role="status" aria-label="Loading">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center border hairline px-8 py-20 text-center">
      <div className="mb-6 h-px w-16 bg-terracotta" aria-hidden />
      <h3 className="font-serif text-2xl">{title}</h3>
      {body && <p className="mt-3 max-w-md text-smoke">{body}</p>}
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = 'left',
  dark = false,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  align?: 'left' | 'center';
  dark?: boolean;
}) {
  return (
    <div className={align === 'center' ? 'text-center' : ''}>
      <p className={`micro-label ${dark ? 'text-ivory/60' : ''}`}>{eyebrow}</p>
      <h2 className={`mt-4 font-serif text-4xl leading-[1.1] md:text-5xl ${dark ? 'text-ivory' : 'text-charcoal'}`}>
        {title}
      </h2>
      {body && (
        <p className={`mt-5 max-w-2xl text-[17px] leading-relaxed ${dark ? 'text-ivory/70' : 'text-smoke'} ${align === 'center' ? 'mx-auto' : ''}`}>
          {body}
        </p>
      )}
    </div>
  );
}
