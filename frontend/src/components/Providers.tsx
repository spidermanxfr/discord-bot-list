'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from 'react-hot-toast';

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            success: {
              style: {
                background: 'rgba(24, 28, 37, 0.9)',
                backdropFilter: 'blur(16px)',
                color: '#FFFFFF',
                borderLeft: '5px solid #57F287',
                borderTop: '1px solid rgba(87, 242, 135, 0.15)',
                borderRight: '1px solid rgba(87, 242, 135, 0.15)',
                borderBottom: '1px solid rgba(87, 242, 135, 0.15)',
                borderRadius: '12px',
                padding: '14px 20px',
                fontWeight: '600',
                fontSize: '0.875rem',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.65), 0 0 20px rgba(87, 242, 135, 0.15)',
              },
              iconTheme: {
                primary: '#57F287',
                secondary: 'rgba(24, 28, 37, 0.9)',
              },
            },
            error: {
              style: {
                background: 'rgba(24, 28, 37, 0.9)',
                backdropFilter: 'blur(16px)',
                color: '#FFFFFF',
                borderLeft: '5px solid #ED4245',
                borderTop: '1px solid rgba(237, 66, 69, 0.15)',
                borderRight: '1px solid rgba(237, 66, 69, 0.15)',
                borderBottom: '1px solid rgba(237, 66, 69, 0.15)',
                borderRadius: '12px',
                padding: '14px 20px',
                fontWeight: '600',
                fontSize: '0.875rem',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.65), 0 0 20px rgba(237, 66, 69, 0.15)',
              },
              iconTheme: {
                primary: '#ED4245',
                secondary: 'rgba(24, 28, 37, 0.9)',
              },
            },
            style: {
              background: 'rgba(24, 28, 37, 0.9)',
              backdropFilter: 'blur(16px)',
              color: '#FFFFFF',
              borderLeft: '5px solid #FEE75C',
              borderTop: '1px solid rgba(254, 231, 92, 0.15)',
              borderRight: '1px solid rgba(254, 231, 92, 0.15)',
              borderBottom: '1px solid rgba(254, 231, 92, 0.15)',
              borderRadius: '12px',
              padding: '14px 20px',
              fontWeight: '600',
              fontSize: '0.875rem',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.65), 0 0 20px rgba(254, 231, 92, 0.1)',
            }
          }}
        />
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
};
export default Providers;
