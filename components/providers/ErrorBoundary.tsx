'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error details to console or error reporting service
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // You can also log to an error reporting service like Sentry
        // logErrorToService(error, errorInfo);

        this.setState({
            error,
            errorInfo,
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-4">
                    <div className="max-w-2xl w-full space-y-8">
                        {/* Error Icon */}
                        <div className="flex justify-center">
                            <div className="rounded-full bg-destructive/10 p-6">
                                <AlertTriangle className="h-16 w-16 text-destructive" />
                            </div>
                        </div>

                        {/* Error Message */}
                        <div className="text-center space-y-3">
                            <h1 className="text-3xl font-bold tracking-tight">
                                Oops! Something went wrong
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                We apologize for the inconvenience. The application encountered an unexpected error.
                            </p>
                        </div>

                        {/* Error Details (in development mode) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                                <div>
                                    <h2 className="font-semibold text-sm text-destructive mb-2">
                                        Error Details:
                                    </h2>
                                    <pre className="text-xs overflow-auto max-h-40 bg-background p-4 rounded border border-border">
                                        {this.state.error.toString()}
                                    </pre>
                                </div>

                                {this.state.errorInfo && (
                                    <div>
                                        <h2 className="font-semibold text-sm text-destructive mb-2">
                                            Component Stack:
                                        </h2>
                                        <pre className="text-xs overflow-auto max-h-60 bg-background p-4 rounded border border-border">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                onClick={this.handleReset}
                                variant="default"
                                size="lg"
                                className="gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Try Again
                            </Button>
                            <Button
                                onClick={this.handleGoHome}
                                variant="outline"
                                size="lg"
                                className="gap-2"
                            >
                                <Home className="h-4 w-4" />
                                Go to Dashboard
                            </Button>
                        </div>

                        {/* Help Text */}
                        <p className="text-center text-sm text-muted-foreground">
                            If this problem persists, please{' '}
                            <a
                                href="mailto:support@example.com"
                                className="text-primary hover:underline"
                            >
                                contact support
                            </a>
                            .
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
