import React from 'react';

interface Props {
  children: React.ReactNode;
}
interface State {
  hasError: boolean;
}

/** Catches render errors so one broken section never blanks the whole page. */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('AeroFareX landing error:', error, info.componentStack);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="container section" role="alert">
          <h2 className="h2">Something went wrong.</h2>
          <p className="lead" style={{ marginTop: 'var(--s-4)' }}>
            Please refresh the page. If it keeps happening, try again in a few minutes.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
