import { parseBold } from '@/utils/parse-bold';

type RichTextProps = {
  text: string;
};

export function RichText({ text }: RichTextProps) {
  return (
    <>
      {parseBold(text).map((segment, index) =>
        // Segmen berasal dari teks tetap yang urutannya tidak berubah, jadi index aman sebagai key.
        segment.isBold ? <strong key={index}>{segment.text}</strong> : <span key={index}>{segment.text}</span>,
      )}
    </>
  );
}
