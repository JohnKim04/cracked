import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-destructive mb-4">Oops!</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Something went wrong. We're working on fixing it.
            </p>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Error: {this.state.error?.message || 'Unknown error'}
              </p>
              <Button onClick={this.handleReset}>
                Return to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;