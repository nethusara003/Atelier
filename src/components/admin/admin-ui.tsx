export function StatusBadge({ status }: { status: string }) {
  const tones: Record<string, string> = {
    // orders
    pending: 'bg-beige text-smoke',
    paid: 'bg-clay/15 text-clay',
    preparing: 'bg-clay/15 text-clay',
    shipped: 'bg-terracotta/10 text-terracotta',
    delivered: 'bg-green-900/10 text-green-900',
    cancelled: 'bg-charcoal text-ivory',
    // artworks
    available: 'bg-green-900/10 text-green-900',
    reserved: 'bg-clay/15 text-clay',
    sold: 'bg-charcoal text-ivory',
    archived: 'bg-beige text-stone',
    // enquiries
    new: 'bg-terracotta/10 text-terracotta',
    replied: 'bg-green-900/10 text-green-900',
    in_discussion: 'bg-clay/15 text-clay',
    accepted: 'bg-green-900/10 text-green-900',
    in_progress: 'bg-terracotta/10 text-terracotta',
    completed: 'bg-green-900/10 text-green-900',
    declined: 'bg-beige text-stone',
  };
  const label = status.replace(/_/g, ' ');
  return (
    <span className={`inline-flex items-center whitespace-nowrap px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider ${tones[status] ?? 'bg-beige text-smoke'}`}>
      {label}
    </span>
  );
}

export function DemoBanner() {
  return (
    <div className="mb-8 border border-clay/40 bg-clay/10 px-6 py-4 text-sm text-smoke" role="note">
      <span className="font-medium text-charcoal">Demo mode.</span> Supabase isn’t
      configured, so you’re browsing sample data. Connect your project (see README)
      to manage live data — changes here are disabled.
    </div>
  );
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyTitle = 'Nothing here yet',
  emptyBody,
}: {
  columns: { header: string; render: (row: T) => React.ReactNode; className?: string }[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyTitle?: string;
  emptyBody?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="border hairline px-8 py-16 text-center">
        <p className="font-serif text-2xl">{emptyTitle}</p>
        {emptyBody && <p className="mt-2 text-sm text-smoke">{emptyBody}</p>}
      </div>
    );
  }
  return (
    <div className="overflow-x-auto border hairline">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b hairline bg-parchment/60">
            {columns.map((c) => (
              <th key={c.header} scope="col" className={`micro-label px-4 py-3 ${c.className ?? ''}`}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-charcoal/8">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="transition-colors hover:bg-parchment/40">
              {columns.map((c) => (
                <td key={c.header} className={`px-4 py-3.5 align-top ${c.className ?? ''}`}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
