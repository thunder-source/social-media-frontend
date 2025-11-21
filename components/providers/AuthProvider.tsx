'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { checkAuthStatus } = useAuth();

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    return <>{children}</>;
}
