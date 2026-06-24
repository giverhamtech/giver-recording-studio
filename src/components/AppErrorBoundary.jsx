import React from 'react';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application render failed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
          <div className="max-w-xl w-full glass-panel rounded-3xl border border-border p-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">Something went wrong</h1>
            <p className="text-muted-foreground mb-6">
              The page hit an unexpected error while rendering. Refresh the page to try again.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="premium-button h-12 px-6"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;