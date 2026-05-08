import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, ScrollRestoration } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { RouteFallback } from './components/layout/RouteFallback';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';

const Landing = lazy(() =>
  import('./pages/Landing').then((m) => ({ default: m.Landing }))
);
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
const Settings = lazy(() =>
  import('./pages/Settings').then((m) => ({ default: m.Settings }))
);

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <ScrollRestoration />
          <Routes>
            <Route
              path="/landing"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <Landing />
                </Suspense>
              }
            />
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/playbooks" element={<Playbooks />} />
              <Route path="/propfirm" element={<PropFirm />} />
              <Route path="/notebook" element={<Notebook />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
}
