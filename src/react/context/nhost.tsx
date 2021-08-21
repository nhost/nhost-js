import { createContext, ReactNode, useState, useEffect } from 'react';
import { NhostClient } from '../../core';
import { NhostAuthContextDef } from '../../types';

// contexts
export const NhostClientContext = createContext<NhostClient | null>(null);
export const NhostSetAuthContext = createContext<Function | null>(null);
export const NhostAuthContext = createContext<NhostAuthContextDef>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

// Nhost Provider
export function NhostProvider({
  children,
  url,
  authUrl,
  storageUrl,
}: {
  children: ReactNode;
  url?: string;
  authUrl?: string;
  storageUrl?: string;
}) {
  const [constructorHasRun, setConstructorHasRun] = useState(false);
  const [nhostClient, setNhostClient] = useState<NhostClient | null>(null);
  const [nhostAuthContext, setNhostAuthContext] = useState<NhostAuthContextDef>(
    {
      user: null,
      isLoading: true,
      isAuthenticated: false,
    }
  );

  let unsubscribe: Function;

  // only run once
  const constructor = () => {
    if (constructorHasRun) return;

    const nhostClient = new NhostClient({
      url: url ? url : '',
      authUrl,
      storageUrl,
    });

    setNhostClient(nhostClient);

    setNhostAuthContext({
      user: null,
      isLoading: nhostClient.auth.isAuthenticated().loading,
      isAuthenticated: nhostClient.auth.isAuthenticated().authenticated,
    });

    unsubscribe = nhostClient.auth.onAuthStateChanged((_event, session) => {
      console.log('auth state changed set nhost auth context');
      setNhostAuthContext({
        user: session ? session.user : null,
        isLoading: false,
        isAuthenticated: session !== null,
      });
    });
    setConstructorHasRun(true);
  };

  constructor();

  useEffect(() => {
    return () => {
      try {
        unsubscribe();
      } catch (error) {}
    };
  });

  return (
    <NhostClientContext.Provider value={nhostClient}>
      <NhostAuthContext.Provider value={nhostAuthContext}>
        <NhostSetAuthContext.Provider value={setNhostAuthContext}>
          {children}
        </NhostSetAuthContext.Provider>
      </NhostAuthContext.Provider>
    </NhostClientContext.Provider>
  );
}
