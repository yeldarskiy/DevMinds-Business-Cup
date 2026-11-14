import { MotionConfig } from 'framer-motion'
import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppShell } from './components/layout/AppShell'
import { PageSkeleton } from './components/ui/Skeleton'
import { AppStateProvider } from './state/AppState'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const BasketBuilderPage = lazy(() => import('./pages/BasketBuilderPage'))
const BasketReportPage = lazy(() => import('./pages/BasketReportPage'))
const OptimizerPage = lazy(() => import('./pages/OptimizerPage'))
const ReceiptVerificationPage = lazy(() => import('./pages/ReceiptVerificationPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function Page({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1400px] p-6">
          <PageSkeleton />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

const router = createBrowserRouter([
  { path: '/', element: <Page><LandingPage /></Page> },
  {
    path: '/app',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/app/basket" replace /> },
      { path: 'basket', element: <BasketBuilderPage /> },
      { path: 'report', element: <BasketReportPage /> },
      { path: 'optimizer', element: <OptimizerPage /> },
      { path: 'receipt', element: <ReceiptVerificationPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  { path: '*', element: <Page><NotFoundPage /></Page> },
])

export function Root() {
  return (
    <AppStateProvider>
      <MotionConfig reducedMotion="user">
        <RouterProvider router={router} />
      </MotionConfig>
      <Toaster position="bottom-right" richColors closeButton toastOptions={{ style: { fontFamily: 'var(--font-sans)' } }} />
    </AppStateProvider>
  )
}
