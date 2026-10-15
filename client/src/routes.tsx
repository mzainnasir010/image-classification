import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingLayout } from './components/layout/LandingLayout';
import { DashboardShell } from './components/layout/DashboardShell';
import { ClassifyPage } from './pages/Classify';
import { HistoryPage } from './pages/History';
import { NotFoundPage } from './pages/NotFound';

// Lazy-load heavier pages so the landing page stays light
const ModelPage = lazy(() =>
  import('./pages/Model').then((m) => ({ default: m.ModelPage }))
);
const ApiDocsPage = lazy(() =>
  import('./pages/ApiDocs').then((m) => ({ default: m.ApiDocsPage }))
);
const LandingPage = lazy(() =>
  import('./pages/Landing').then((m) => ({ default: m.LandingPage }))
);

function PageLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="skeleton h-8 w-32 rounded" />
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public site */}
        <Route element={<LandingLayout />}>
          <Route
            path="/"
            element={
              <Suspense fallback={<PageLoader />}>
                <LandingPage />
              </Suspense>
            }
          />
        </Route>

        {/* Dashboard */}
        <Route path="/app" element={<DashboardShell />}>
          <Route index element={<ClassifyPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route
            path="model"
            element={
              <Suspense fallback={<PageLoader />}>
                <ModelPage />
              </Suspense>
            }
          />
          <Route
            path="api"
            element={
              <Suspense fallback={<PageLoader />}>
                <ApiDocsPage />
              </Suspense>
            }
          />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
