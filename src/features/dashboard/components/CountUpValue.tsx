import { useMediaQuery } from '../../../hooks/use-media-query';
import { useCountUp } from '../hooks/use-count-up';

type CountUpValueProps = {
  value: number;
  format: (value: number) => string;
  // True hanya saat konten dasbor pertama kali tampil; pemanggil yang menentukan kapan efeknya boleh diputar.
  animate: boolean;
};

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

// Selama berhitung, angka sementara disembunyikan dari pembaca layar (aria-hidden) dan nilai akhirnya dibacakan lewat sr-only,
// supaya wilayah aria-live di sekitarnya tidak mengumumkan puluhan angka antara.
export function CountUpValue({ value, format, animate }: CountUpValueProps) {
  const isReducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const count = useCountUp(value, animate && !isReducedMotion);

  if (!count.isPlaying) return <>{format(value)}</>;

  return (
    <>
      <span aria-hidden="true">{format(count.value)}</span>
      <span className="sr-only">{format(value)}</span>
    </>
  );
}
