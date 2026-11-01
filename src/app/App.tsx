import { lazy, Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { LoadingFallback } from './LoadingFallback';

const WelcomePage = lazy(() => import('../features/welcome/WelcomePage'));

export function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <WelcomePage />
      </Suspense>
    </ErrorBoundary>
  );
}
