import type { ReactNode } from 'react';

import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';

type SectionCardProps = {
  // Dipakai untuk menghubungkan <section> dengan judulnya (aria-labelledby).
  id: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function SectionCard({ id, title, description, children }: SectionCardProps) {
  return (
    <section aria-labelledby={id}>
      <Card>
        <CardHeader>
          <h2 id={id} className="text-lg font-semibold">
            {title}
          </h2>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">{children}</CardContent>
      </Card>
    </section>
  );
}
