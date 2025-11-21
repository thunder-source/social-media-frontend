"use client";

import * as React from "react";
import { Search, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce"; // We might need to create this hook if it doesn't exist
import { cn } from "@/lib/utils";

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
    className?: string;
    isLoading?: boolean;
}

export function SearchBar({
    onSearch,
    placeholder = "Search...",
    className,
    isLoading = false,
}: SearchBarProps) {
    const [value, setValue] = React.useState("");

    // Simple debounce implementation inside component if hook doesn't exist, 
    // but ideally we should check for a hook. For now, I'll implement a local effect.

    React.useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(value);
        }, 500);

        return () => clearTimeout(timer);
    }, [value, onSearch]);

    const handleClear = () => {
        setValue("");
        onSearch("");
    };

    return (
        <div className={cn("relative w-full max-w-sm", className)}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="pl-9 pr-9 bg-muted/50 border-transparent focus:bg-background focus:border-primary transition-all duration-300"
            />
            {value && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={handleClear}
                >
                    {isLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                        <X className="h-3 w-3" />
                    )}
                </Button>
            )}
        </div>
    );
}
