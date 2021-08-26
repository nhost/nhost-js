import { createContext, ReactNode, useState, useEffect } from 'react';
import { NhostClient } from '../../core';
import { NhostAuthContextDef } from '../../types';

// contexts
export const NhostClientContext = createContext<NhostClient | null>(null);
export const NhostSetAuthContext = createContext<Function | null>(null);
export const NhostAuthContext = createContext<NhostAuthContextDef>({
  isLoading: true,
  isSuccess: true,
  isError: false,
  error: null,
  user: null,
  isAuthenticated: false,
});

// Nhost Provider
export function NhostProvider({
  children,
  url,
  authUrl,
  storageUrl,
  graphqlUrl,
}: {
  children: ReactNode;
  url?: string;
  authUrl?: string;
  storageUrl?: string;
  graphqlUrl?: string;
}) {
  const [constructorHasRun, setConstructorHasRun] = useState(false);
  const [nhostClient, setNhostClient] = useState<NhostClient | null>(null);
  const [nhostAuthContext, setNhostAuthContext] = useState<NhostAuthContextDef>(
    {
      isLoading: true,
      isSuccess: false,
      isError: false,
      error: null,
      user: null,
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
      graphqlUrl,
    });

    setNhostClient(nhostClient);

    const { isAuthenticated, isLoading } =
      nhostClient.auth.getAuthenticationStatus();

    setNhostAuthContext({
      isLoading,
      isSuccess: isLoading === false,
      isError: false,
      error: null,
      user: nhostClient.auth.getUser(),
      isAuthenticated,
    });

    unsubscribe = nhostClient.auth.onAuthStateChanged((_event, session) => {
      const { isAuthenticated } = nhostClient.auth.getAuthenticationStatus();
      setNhostAuthContext({
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: null,
        user: session ? session.user : null,
        isAuthenticated,
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
