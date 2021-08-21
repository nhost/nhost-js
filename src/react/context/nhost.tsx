import { createContext, ReactNode, useState, useEffect } from 'react';
import { NhostClient } from '../../core';
import { NhostContextDef } from '../../types';

export const NhostContext = createContext<NhostContextDef>({
  client: null,
  auth: {
    user: null,
    isLoading: true,
    isAuthenticated: false,
  },
});

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
  const [nhostContext, setAuthContext] = useState<NhostContextDef>({
    client: null,
    auth: {
      user: null,
      isLoading: true,
      isAuthenticated: false,
    },
  });

  let unsubscribe: Function;

  // only run once
  const constructor = () => {
    if (constructorHasRun) return;

    const nhost = new NhostClient({
      url: url ? url : '',
      authUrl,
      storageUrl,
    });

    setAuthContext({
      client: nhost,
      auth: {
        user: null,
        isLoading: nhost.auth.isAuthenticated().loading,
        isAuthenticated: nhost.auth.isAuthenticated().authenticated,
      },
    });

    unsubscribe = nhost.auth.onAuthStateChanged((_event, session) => {
      setAuthContext({
        client: nhost,
        auth: {
          user: session ? session.user : null,
          isLoading: false,
          isAuthenticated: session !== null,
        },
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
    <NhostContext.Provider value={nhostContext}>
      {children}
    </NhostContext.Provider>
  );
}
