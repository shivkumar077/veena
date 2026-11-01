import { ErrorBoundary } from './ErrorBoundary';
import WelcomePage from '../features/welcome/WelcomePage';

export function App() {
  return (
    <ErrorBoundary>
      <WelcomePage />
    </ErrorBoundary>
  );
}
