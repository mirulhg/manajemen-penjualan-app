import { createBrowserRouter, Outlet } from 'react-router';

import { OwnerOnly } from '../features/session';
import { AppLayout } from './AppLayout';
import { HomeRedirect } from './HomeRedirect';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <HomeRedirect /> },
      {
        path: 'stok',
        lazy: async () => {
          // Impor langsung (bukan lewat features/stock/index.ts): main.tsx sudah memuat barrel itu untuk seed, jadi lewat barrel tidak akan jadi chunk terpisah.
          const { StockListPage } = await import('../features/stock/components/StockListPage');
          return { Component: StockListPage };
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
        path: 'kasir',
        lazy: async () => {
          const { CashierPage } = await import('../features/sales/components/CashierPage');
          return { Component: CashierPage };
        },
      },
      {
        // Pemilik selalu; kasir hanya bila pengaturannya aktif (dijaga di dalam halamannya).
        path: 'peringatan',
        lazy: async () => {
          const { AlertsPage } = await import('../features/alerts/components/AlertsPage');
          return { Component: AlertsPage };
        },
      },
      {
        path: 'keluar-mode-kasir',
        lazy: async () => {
          const { ExitCashierModePage } = await import('../features/session/components/ExitCashierModePage');
          return { Component: ExitCashierModePage };
        },
      },
      {
        // Halaman khusus pemilik: di Mode Kasir, OwnerOnly menggantikan isinya, termasuk saat URL dibuka langsung.
        element: (
          <OwnerOnly>
            <Outlet />
          </OwnerOnly>
        ),
        children: [
          {
            path: 'dasbor',
            lazy: async () => {
              const { DashboardPage } = await import('../features/dashboard/components/DashboardPage');
              return { Component: DashboardPage };
            },
          },
          {
            path: 'dasbor/produk',
            lazy: async () => {
              const { ProductAnalysisPage } = await import('../features/dashboard/components/ProductAnalysisPage');
              return { Component: ProductAnalysisPage };
            },
          },
          {
            path: 'laporan',
            lazy: async () => {
              const { ReportsPage } = await import('../features/reports/components/ReportsPage');
              return { Component: ReportsPage };
            },
          },
          {
            path: 'laporan/penjualan',
            lazy: async () => {
              const { SalesReportPage } = await import('../features/reports/components/SalesReportPage');
              return { Component: SalesReportPage };
            },
          },
          {
            path: 'laporan/laba-kotor',
            lazy: async () => {
              const { ProfitReportPage } = await import('../features/reports/components/ProfitReportPage');
              return { Component: ProfitReportPage };
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
            path: 'stok/baru',
            lazy: async () => {
              const { NewProductPage } = await import('../features/stock/components/NewProductPage');
              return { Component: NewProductPage };
            },
          },
          {
            path: 'stok/impor',
            lazy: async () => {
              const { ImportProductsPage } = await import('../features/stock/components/ImportProductsPage');
              return { Component: ImportProductsPage };
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
            path: 'kategori',
            lazy: async () => {
              const { CategoriesPage } = await import('../features/stock/components/CategoriesPage');
              return { Component: CategoriesPage };
            },
          },
          {
            path: 'pengaturan',
            lazy: async () => {
              const { SettingsPage } = await import('../features/session/components/SettingsPage');
              return { Component: SettingsPage };
            },
          },
        ],
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
