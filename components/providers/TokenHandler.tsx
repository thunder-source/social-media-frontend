"use client";

import { useEffect } from "react";
import { setCookie } from "@/lib/utils";

/**
 * Global component that handles token extraction from URL parameters
 * This ensures tokens are always removed from the URL and stored in cookies
 */
export default function TokenHandler() {
    useEffect(() => {
        // Only run on client side
        if (typeof window === "undefined") return;

        const searchParams = new URLSearchParams(window.location.search);
        const tokenParam = searchParams.get("token");

        // If token is present in URL, store it as a cookie and clean the URL
        if (tokenParam) {
            // Store token in cookie (expires in 7 days by default)
            setCookie("token", tokenParam, 7);

            // Remove token from URL
            searchParams.delete("token");

            // Build new URL without the token parameter
            const newUrl = `${window.location.pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;

            // Replace the current URL without reloading the page
            window.history.replaceState({}, '', newUrl);

            console.log("Token stored in cookie and removed from URL");
        }
    }, []); // Run only once on mount

    // This component doesn't render anything
    return null;
}
