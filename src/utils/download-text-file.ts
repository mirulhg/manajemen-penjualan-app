export function downloadTextFile(fileName: string, content: string, mimeType: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  // Dicabut setelah klik; ditunda satu putaran agar unduhan sempat dimulai di semua browser.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
