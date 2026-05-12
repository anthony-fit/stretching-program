import React, { Component, ErrorInfo, ReactNode } from "react";
import { Link } from "react-router-dom";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught runtime error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-cream/90 px-4">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-xl border border-charcoal/5">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-sans font-semibold text-charcoal mb-2">Something went wrong</h1>
            <p className="text-charcoal/60 mb-6 font-sans">
              We've encountered an unexpected error. Please try reloading the session or return to the dashboard.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={this.handleReload}
                className="w-full bg-charcoal text-cream py-3 rounded-full font-medium hover:bg-black transition-colors"
              >
                Reload Session
              </button>
              <Link 
                to="/dashboard"
                onClick={() => this.setState({ hasError: false })}
                className="w-full text-center bg-cream text-charcoal py-3 rounded-full font-medium hover:bg-gold/10 transition-colors"
              >
                Return to Dashboard
              </Link>
            </div>
            
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg overflow-x-auto text-xs text-charcoal/60 font-mono">
                {this.state.error.toString()}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
