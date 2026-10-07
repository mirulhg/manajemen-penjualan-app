// Impor font di sini, bukan di main.tsx: hanya Pengaturan yang memakai Alex Brush (pengecualian font di CLAUDE.md §7).
import '@fontsource/alex-brush';

// Satu kalimat utuh untuk pembaca layar: "developed by dev.myrules".
export function DeveloperSignature() {
  return (
    <p className="text-sm text-muted-foreground">
      developed by <span className="font-signature text-2xl text-foreground">dev.myrules</span>
    </p>
  );
}
