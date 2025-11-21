'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
    children: ReactNode;
    fallbackMessage?: string;
    onReset?: () => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * SectionErrorBoundary - A lightweight error boundary for specific sections/components
 * Use this to isolate errors to specific parts of your UI instead of crashing the whole app
 */
class SectionErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('SectionErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
        });

        // Call custom onReset callback if provided
        if (this.props.onReset) {
            this.props.onReset();
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <Card className="border-destructive/50">
                    <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="rounded-full bg-destructive/10 p-3">
                                <AlertCircle className="h-8 w-8 text-destructive" />
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg">
                                    {this.props.fallbackMessage || 'Something went wrong'}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    This section encountered an error and couldn&apos;t be displayed.
                                </p>
                            </div>

                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="w-full">
                                    <details className="text-left">
                                        <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                                            Show error details
                                        </summary>
                                        <pre className="mt-2 text-xs overflow-auto max-h-32 bg-muted p-3 rounded border border-border">
                                            {this.state.error.toString()}
                                        </pre>
                                    </details>
                                </div>
                            )}

                            <Button
                                onClick={this.handleReset}
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <RefreshCw className="h-3 w-3" />
                                Try Again
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        return this.props.children;
    }
}

export default SectionErrorBoundary;
