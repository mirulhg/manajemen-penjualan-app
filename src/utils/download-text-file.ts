export function downloadBlob(fileName: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  // Dicabut setelah klik; ditunda satu putaran agar unduhan sempat dimulai di semua browser.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function downloadTextFile(fileName: string, content: string, mimeType: string) {
  downloadBlob(fileName, new Blob([content], { type: mimeType }));
}
