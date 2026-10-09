import { parseBold } from '../parse-bold';

type HelpRichTextProps = {
  text: string;
};

export function HelpRichText({ text }: HelpRichTextProps) {
  return (
    <>
      {parseBold(text).map((segment, index) =>
        // Segmen berasal dari teks tetap yang urutannya tidak berubah, jadi index aman sebagai key.
        segment.isBold ? <strong key={index}>{segment.text}</strong> : <span key={index}>{segment.text}</span>,
      )}
    </>
  );
}
