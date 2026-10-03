const BOM = '﻿';

// Excel berbahasa Indonesia menyimpan CSV dengan ';', yang lain dengan ','; ditentukan dari baris pertama di luar tanda kutip.
function detectDelimiter(text: string): ';' | ',' {
  let semicolons = 0;
  let commas = 0;
  let isQuoted = false;
  for (const char of text) {
    if (char === '"') isQuoted = !isQuoted;
    else if (!isQuoted && (char === '\n' || char === '\r')) break;
    else if (!isQuoted && char === ';') semicolons += 1;
    else if (!isQuoted && char === ',') commas += 1;
  }
  return semicolons > commas ? ';' : ',';
}

export function parseCsv(input: string): string[][] {
  const text = input.startsWith(BOM) ? input.slice(1) : input;
  const delimiter = detectDelimiter(text);
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let isQuoted = false;

  function endCell() {
    row.push(cell);
    cell = '';
  }

  function endRow() {
    endCell();
    rows.push(row);
    row = [];
  }

  for (let index = 0; index < text.length; index += 1) {
    const char = text.charAt(index);
    if (isQuoted) {
      if (char !== '"') cell += char;
      else if (text.charAt(index + 1) === '"') {
        cell += '"';
        index += 1;
      } else isQuoted = false;
    } else if (char === '"') isQuoted = true;
    else if (char === delimiter) endCell();
    else if (char === '\n') endRow();
    else if (char === '\r') {
      if (text.charAt(index + 1) === '\n') index += 1;
      endRow();
    } else cell += char;
  }
  if (cell !== '' || row.length > 0) endRow();

  while (rows.length > 0 && (rows[rows.length - 1] ?? []).every((value) => value === '')) rows.pop();
  return rows;
}
