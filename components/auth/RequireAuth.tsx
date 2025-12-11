'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingState } from '@/components/shared/LoadingState';
import { logger, LOG_CONTEXTS } from '@/lib/utils/logger';
import TitlePickerModal from '@/components/shared/TitlePickerModal';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showTitlePicker, setShowTitlePicker] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        const publicRoutes = ['/', '/auth', '/fantasy'];
        const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/auth') || pathname.startsWith('/fantasy');
        
        if (!isPublicRoute) {
          logger.debug(LOG_CONTEXTS.AUTH, `Redirecting to auth page from: ${pathname}`);
          // Store the attempted URL to redirect back after login
          const redirectUrl = encodeURIComponent(pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''));
          sessionStorage.setItem('authRedirect', redirectUrl);
          router.push(`/auth?redirect=${redirectUrl}`);
        } else {
          setIsAuthorized(true);
        }
      } else {
        // User is authenticated
        setIsAuthorized(true);
        
        // If on auth page and logged in, check for redirect or go to dashboard
        if (pathname === '/auth') {
          const redirectParam = searchParams.get('redirect');
          const storedRedirect = sessionStorage.getItem('authRedirect');
          const redirectTo = redirectParam 
            ? decodeURIComponent(redirectParam)
            : storedRedirect 
              ? decodeURIComponent(storedRedirect)
              : '/dashboard';
          
          // Clear the stored redirect
          sessionStorage.removeItem('authRedirect');
          router.push(redirectTo);
        }
      }
    }
  }, [user, loading, router, pathname, searchParams]);

  // Show title picker modal if user hasn't selected their title yet
  useEffect(() => {
    if (user && userProfile && !userProfile.hasSelectedTitle) {
      setShowTitlePicker(true);
    }
  }, [user, userProfile]);

  /**
   * @description Handles completion of title selection.
   */
  const handleTitlePickerComplete = async () => {
    await refreshProfile();
    setShowTitlePicker(false);
  };

  if (loading) {
    return <LoadingState message="Checking authentication..." />;
  }

  // Prevent flash of content for protected routes while checking auth
  if (!user && !isAuthorized) {
    return null;
  }

  return (
    <>
      {children}
      <TitlePickerModal
        isOpen={showTitlePicker}
        onComplete={handleTitlePickerComplete}
      />
    </>
  );
}
