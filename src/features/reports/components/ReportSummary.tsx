import type { ReactNode } from 'react';

type ReportSummaryProps = {
  items: { label: string; value: string }[];
  note?: ReactNode;
};

export function ReportSummary({ items, note }: ReportSummaryProps) {
  return (
    <section aria-labelledby="report-summary-heading" className="space-y-3">
      <h2 id="report-summary-heading" className="text-lg font-semibold">
        Ringkasan
      </h2>
      <dl className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-md border border-border p-3">
            <dt className="text-sm text-muted-foreground">{item.label}</dt>
            <dd className="mt-1 font-semibold">{item.value}</dd>
          </div>
        ))}
      </dl>
      {note && <p className="text-sm text-muted-foreground">{note}</p>}
    </section>
  );
}
