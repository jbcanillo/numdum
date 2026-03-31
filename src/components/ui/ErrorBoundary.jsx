import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-2xl mx-auto mt-10">
          <div className="rounded-lg border border-[var(--error)] bg-[var(--error)]/10 p-6">
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--error)' }}>
              Something went wrong
            </h2>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
              {this.state.error?.toString() || 'An unexpected error occurred'}
            </p>
            {this.state.errorInfo && (
              <details className="mb-4 p-3 rounded bg-[var(--bg-secondary)] overflow-auto text-sm font-mono">
                <summary style={{ color: 'var(--text-tertiary)' }}>Error details</summary>
                <pre className="mt-2 whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
              </details>
            )}
            <button onClick={this.handleReset} className="btn btn-primary">
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
