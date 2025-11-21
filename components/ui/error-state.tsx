import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    retryLabel?: string;
}

export function ErrorState({
    title = "Something went wrong",
    message = "We encountered an error while loading this content.",
    onRetry,
    retryLabel = "Try again",
}: ErrorStateProps) {
    return (
        <div className="p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Alert variant="destructive" className="flex flex-col items-start gap-4">
                <div className="flex items-start gap-4 w-full">
                    <AlertCircle className="h-5 w-5 mt-0.5" />
                    <div className="flex-1">
                        <AlertTitle className="text-base font-semibold">{title}</AlertTitle>
                        <AlertDescription className="mt-1 text-sm opacity-90">
                            {message}
                        </AlertDescription>
                    </div>
                </div>
                {onRetry && (
                    <div className="pl-9">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRetry}
                            className="bg-background/10 hover:bg-background/20 border-transparent text-destructive-foreground hover:text-destructive-foreground"
                        >
                            <RefreshCcw className="mr-2 h-3 w-3" />
                            {retryLabel}
                        </Button>
                    </div>
                )}
            </Alert>
        </div>
    );
}
