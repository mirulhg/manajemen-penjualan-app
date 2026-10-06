import { visibleLabelIndexes } from './chart-scale';
import type { BarDatum } from './BarChart';

type VerticalBarsProps = {
  data: BarDatum[];
  maxValue: number;
  active: number | null;
  onActivate: (index: number) => void;
  formatValue: (value: number) => string;
};

const MAX_LABELS = 12;

// Batang menempel ke garis dasar di bawah; hanya ujung atas yang membulat. Jarak antarbatang 2px.
export function VerticalBars({ data, maxValue, active, onActivate, formatValue }: VerticalBarsProps) {
  const labelIndexes = new Set(visibleLabelIndexes(data.length, MAX_LABELS));
  const firstMaxIndex = data.findIndex((datum) => datum.value === maxValue);

  return (
    <div aria-hidden="true">
      <div className="flex h-48 items-end gap-0.5 border-b border-border pt-6">
        {data.map((datum, index) => {
          const isActive = active === index;
          const showValue = isActive || (active === null && index === firstMaxIndex);
          const height = maxValue > 0 ? (datum.value / maxValue) * 100 : 0;
          return (
            <div
              key={datum.label}
              onPointerEnter={() => onActivate(index)}
              className={`relative h-full flex-1 ${active !== null && !isActive ? 'opacity-60' : ''}`}
            >
              <div style={{ height: `${height}%` }} className="absolute inset-x-0 bottom-0 rounded-t bg-chart-1" />
              {showValue && (
                <span
                  style={{ bottom: `${height}%` }}
                  className="absolute left-1/2 -translate-x-1/2 pb-1 text-xs font-medium"
                >
                  {formatValue(datum.value)}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex gap-0.5 text-xs text-muted-foreground">
        {data.map((datum, index) => (
          <span key={datum.label} className="mt-1 flex-1 text-center">
            {labelIndexes.has(index) ? datum.label : ''}
          </span>
        ))}
      </div>
    </div>
  );
}
