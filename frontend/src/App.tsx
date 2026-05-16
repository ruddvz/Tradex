import { lazy, Suspense } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  ScrollRestoration,
  Outlet,
  Navigate,
} from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedLayout } from './components/auth/ProtectedLayout';
import { RouteFallback } from './components/layout/RouteFallback';
import { authUiEnabled, requireLogin } from './lib/featureFlags';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';

const Landing = lazy(() =>
  import('./pages/Landing').then((m) => ({ default: m.Landing }))
);
const Auth = lazy(() => import('./pages/Auth').then((m) => ({ default: m.Auth })));
const Dashboard = lazy(() =>
  import('./pages/Dashboard').then((m) => ({ default: m.Dashboard }))
);
const Journal = lazy(() =>
  import('./pages/Journal').then((m) => ({ default: m.Journal }))
);
const Playbooks = lazy(() =>
  import('./pages/Playbooks').then((m) => ({ default: m.Playbooks }))
);
const PropFirm = lazy(() =>
  import('./pages/PropFirm').then((m) => ({ default: m.PropFirm }))
);
const Notebook = lazy(() =>
  import('./pages/Notebook').then((m) => ({ default: m.Notebook }))
);
const Reports = lazy(() =>
  import('./pages/Reports').then((m) => ({ default: m.Reports }))
);
const Calculator = lazy(() =>
  import('./pages/Calculator').then((m) => ({ default: m.Calculator }))
);
const PaperTrading = lazy(() =>
  import('./pages/PaperTrading').then((m) => ({ default: m.PaperTrading }))
);
const Settings = lazy(() =>
  import('./pages/Settings').then((m) => ({ default: m.Settings }))
);

const AppShell = requireLogin ? ProtectedLayout : Layout;

function RootLayout() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter(
  [
    {
      element: <RootLayout />,
      children: [
        {
          path: 'landing',
          element: (
            <Suspense fallback={<RouteFallback />}>
              <Landing />
            </Suspense>
          ),
        },
        {
          path: 'auth',
          element: authUiEnabled ? (
            <Suspense fallback={<RouteFallback />}>
              <Auth />
            </Suspense>
          ) : (
            <Navigate to="/" replace />
          ),
        },
        {
          element: <AppShell />,
          children: [
            {
              index: true,
              element: <Dashboard />,
            },
            {
              path: 'journal',
              element: <Journal />,
            },
            {
              path: 'playbooks',
              element: <Playbooks />,
            },
            {
              path: 'propfirm',
              element: <PropFirm />,
            },
            {
              path: 'notebook',
              element: <Notebook />,
            },
            {
              path: 'reports',
              element: <Reports />,
            },
            {
              path: 'calculator',
              element: <Calculator />,
            },
            {
              path: 'paper-trading',
              element: <PaperTrading />,
            },
            {
              path: 'settings',
              element: <Settings />,
            },
          ],
        },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL }
);

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </ErrorBoundary>
  );
}
