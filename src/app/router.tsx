import { createBrowserRouter, Navigate, Outlet } from 'react-router';

import { MainNav } from '../components/layout/MainNav';
import { PageShell } from '../components/layout/PageShell';

export const router = createBrowserRouter([
  {
    element: (
      <PageShell nav={<MainNav />}>
        <Outlet />
      </PageShell>
    ),
    children: [
      { index: true, element: <Navigate to="/stok" replace /> },
      {
        path: 'stok',
        lazy: async () => {
          // Impor langsung (bukan lewat features/stock/index.ts): main.tsx sudah memuat barrel itu untuk seed, jadi lewat barrel tidak akan jadi chunk terpisah.
          const { StockListPage } = await import('../features/stock/components/StockListPage');
          return { Component: StockListPage };
        },
      },
      {
        path: 'penjualan',
        lazy: async () => {
          const { SaleHistoryPage } = await import('../features/sales/components/SaleHistoryPage');
          return { Component: SaleHistoryPage };
        },
      },
      {
        path: 'penjualan/:saleId',
        lazy: async () => {
          const { SaleDetailPage } = await import('../features/sales/components/SaleDetailPage');
          return { Component: SaleDetailPage };
        },
      },
      {
        path: 'kasir',
        lazy: async () => {
          const { CashierPage } = await import('../features/sales/components/CashierPage');
          return { Component: CashierPage };
        },
      },
      {
        path: 'stok/baru',
        lazy: async () => {
          const { NewProductPage } = await import('../features/stock/components/NewProductPage');
          return { Component: NewProductPage };
        },
      },
      {
        path: 'stok/:productId',
        lazy: async () => {
          const { ProductDetailPage } = await import('../features/stock/components/ProductDetailPage');
          return { Component: ProductDetailPage };
        },
      },
      {
        path: 'stok/:productId/ubah',
        lazy: async () => {
          const { EditProductPage } = await import('../features/stock/components/EditProductPage');
          return { Component: EditProductPage };
        },
      },
      {
        path: 'stok/:productId/sesuaikan',
        lazy: async () => {
          const { AdjustStockPage } = await import('../features/stock/components/AdjustStockPage');
          return { Component: AdjustStockPage };
        },
      },
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
