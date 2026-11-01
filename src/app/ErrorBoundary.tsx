import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      '[VEENA] The application failed to render.',
      error,
      errorInfo,
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="app-error" role="alert">
          <p className="eyebrow">A moment of quiet</p>
          <h1>We could not open this listening space.</h1>
          <p>Please try again. If the problem continues, reload the page.</p>
          <button
            className="text-link"
            onClick={() => window.location.reload()}
            type="button"
          >
            Reload VEENA
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
