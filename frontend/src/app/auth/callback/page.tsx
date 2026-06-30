'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AuthCallbackHandler = () => {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      login(token);
      toast.success('Successfully logged in via Discord!');
      router.push('/dashboard');
    } else {
      toast.error('Authentication failed. No token received.');
      router.push('/');
    }
  }, [searchParams, login, router]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="h-10 w-10 text-primary-custom animate-spin" />
      <h2 className="text-xl font-bold text-white">Finalizing login...</h2>
      <p className="text-sm text-muted-text">Please wait while we sync your Discord session.</p>
    </div>
  );
};

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-10 w-10 text-primary-custom animate-spin" />
      </div>
    }>
      <AuthCallbackHandler />
    </Suspense>
  );
}
