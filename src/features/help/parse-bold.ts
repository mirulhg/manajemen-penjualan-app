export type HelpTextSegment = { text: string; isBold: boolean };

// Satu-satunya format teks panduan: **tebal**. Penanda yang tidak berpasangan ditampilkan apa adanya.
export function parseBold(text: string): HelpTextSegment[] {
  const parts = text.split('**');
  if (parts.length % 2 === 0) return [{ text, isBold: false }];
  return parts.flatMap((part, index) => (part === '' ? [] : [{ text: part, isBold: index % 2 === 1 }]));
}
