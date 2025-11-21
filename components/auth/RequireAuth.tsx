'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingState } from '@/components/shared/LoadingState';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Public routes that don't require auth
        const publicRoutes = ['/', '/auth', '/ap-lang', '/improve'];
        const isPublicRoute = publicRoutes.includes(pathname) || 
                             pathname.startsWith('/auth') || 
                             pathname === '/';
        
        if (!isPublicRoute) {
          console.log('🔒 Redirecting to auth page from:', pathname);
          // Store the attempted URL to redirect back after login
          // We could use a query param or sessionStorage for this
          router.push('/auth');
        } else {
          setIsAuthorized(true);
        }
      } else {
        // User is authenticated
        setIsAuthorized(true);
        
        // If on auth page and logged in, redirect to dashboard
        if (pathname === '/auth') {
          router.push('/dashboard');
        }
      }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return <LoadingState message="Checking authentication..." />;
  }

  // Prevent flash of content for protected routes while checking auth
  if (!user && !isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
