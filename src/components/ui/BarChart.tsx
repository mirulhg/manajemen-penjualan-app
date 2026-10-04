import { ChartTable } from './ChartTable';
import { HorizontalBars } from './HorizontalBars';
import { useChartCursor } from './use-chart-cursor';
import { VerticalBars } from './VerticalBars';

export type BarDatum = { label: string; value: number };

type BarChartProps = {
  title: string;
  data: BarDatum[];
  orientation: 'horizontal' | 'vertical';
  formatValue: (value: number) => string;
  // Judul kolom tabel alternatif: label batang dan nilainya.
  columns: { label: string; value: string };
};

// Satu seri tanpa legenda: judulnya sudah menyebut isi grafik.
export function BarChart({ title, data, orientation, formatValue, columns }: BarChartProps) {
  const cursor = useChartCursor(data.length, 'band');

  if (data.length === 0) return null;

  const maxValue = Math.max(0, ...data.map((datum) => datum.value));
  const activeDatum = cursor.active !== null ? data[cursor.active] : undefined;
  const Bars = orientation === 'horizontal' ? HorizontalBars : VerticalBars;

  function handlePointerLeave() {
    cursor.setActive(null);
  }

  return (
    <figure>
      <figcaption className="font-semibold">{title}</figcaption>
      <div
        role="group"
        aria-label={`${title}. Gunakan panah untuk berpindah batang.`}
        {...cursor.containerProps}
        onPointerLeave={handlePointerLeave}
        className="mt-3"
      >
        <Bars
          data={data}
          maxValue={maxValue}
          active={cursor.active}
          onActivate={cursor.setActive}
          formatValue={formatValue}
        />
      </div>
      <p aria-live="polite" className="sr-only">
        {activeDatum ? `${activeDatum.label}: ${formatValue(activeDatum.value)}` : ''}
      </p>
      <ChartTable
        caption={title}
        headers={[columns.label, columns.value]}
        rows={data.map((datum) => [datum.label, formatValue(datum.value)])}
      />
    </figure>
  );
}
