import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LazyMotion, MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';

import { SessionProvider } from '../features/session';

const queryClient = new QueryClient();

const loadMotionFeatures = () => import('../lib/motion-features').then((module) => module.default);

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <LazyMotion features={loadMotionFeatures} strict>
          <SessionProvider>{children}</SessionProvider>
        </LazyMotion>
      </MotionConfig>
    </QueryClientProvider>
  );
}
