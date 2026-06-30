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
                background: '#2B2D31',
                color: '#FFFFFF',
                borderLeft: '4px solid #57F287',
                borderTop: '1px solid rgba(255,255,255,0.03)',
                borderRight: '1px solid rgba(255,255,255,0.03)',
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                borderRadius: '6px',
                padding: '12px 16px',
                fontWeight: '600',
                fontSize: '0.875rem',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              },
              iconTheme: {
                primary: '#57F287',
                secondary: '#2B2D31',
              },
            },
            error: {
              style: {
                background: '#2B2D31',
                color: '#FFFFFF',
                borderLeft: '4px solid #ED4245',
                borderTop: '1px solid rgba(255,255,255,0.03)',
                borderRight: '1px solid rgba(255,255,255,0.03)',
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                borderRadius: '6px',
                padding: '12px 16px',
                fontWeight: '600',
                fontSize: '0.875rem',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              },
              iconTheme: {
                primary: '#ED4245',
                secondary: '#2B2D31',
              },
            },
            style: {
              background: '#2B2D31',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '6px',
              padding: '12px 16px',
              fontWeight: '600',
              fontSize: '0.875rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            }
          }}
        />
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
};
export default Providers;
