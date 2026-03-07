import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    (this as any).state = { hasError: false };
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if ((this as any).state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] text-white p-8">
          <div className="max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong.</h2>
            <p className="text-zinc-400 mb-8">The emergency system encountered an unexpected error.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-600 rounded-xl font-bold hover:bg-red-700 transition-colors"
            >
              Reload System
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
