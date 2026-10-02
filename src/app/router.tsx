import { createBrowserRouter, Outlet } from 'react-router';

import { PageShell } from '../components/layout/PageShell';

export const router = createBrowserRouter([
  {
    element: (
      <PageShell>
        <Outlet />
      </PageShell>
    ),
    children: [
      {
        path: '*',
        lazy: async () => {
          const { NotFound } = await import('./NotFound');
          return { Component: NotFound };
        },
      },
    ],
  },
]);
