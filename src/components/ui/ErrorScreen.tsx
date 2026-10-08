import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

type ErrorScreenProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  // Tombol atau tautan aksi; aksi pertama dianggap utama oleh pemanggil.
  children: ReactNode;
  detail?: string;
};

export function ErrorScreen({ icon: Icon, title, description, children, detail }: ErrorScreenProps) {
  return (
    <section className="mx-auto flex max-w-md flex-col items-center py-12 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <Icon aria-hidden="true" className="size-8" />
      </span>
      <h1 className="mt-6 text-xl font-semibold">{title}</h1>
      <p className="mt-2 text-muted-foreground">{description}</p>
      <div className="mt-6 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">{children}</div>
      {detail && (
        <details className="mt-6 w-full text-left">
          <summary className="flex min-h-11 cursor-pointer items-center text-sm font-medium">Detail teknis</summary>
          <pre className="mt-2 text-sm break-words whitespace-pre-wrap text-muted-foreground">{detail}</pre>
        </details>
      )}
    </section>
  );
}
