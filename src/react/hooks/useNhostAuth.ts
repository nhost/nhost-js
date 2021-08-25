import { SignInOptions } from '@nhost/hasura-auth-js';
import { useContext } from 'react';
import {
  NhostAuthContext,
  NhostClientContext,
  NhostSetAuthContext,
} from '../context';

export function useNhostAuth() {
  const nhost = useContext(NhostClientContext)!;
  const nhostAuthContext = useContext(NhostAuthContext);
  const setNhostAuthContext = useContext(NhostSetAuthContext)!;

  const ret = {
    signIn: async (params: SignInOptions) => {
      setNhostAuthContext({
        isLoading: true,
        isSuccess: false,
        isError: false,
        error: null,
        user: null,
        isAuthenticated: nhost.auth.isAuthenticated(),
      });

      const { session, error } = await nhost?.auth.signIn(params);

      if (error) {
        return setNhostAuthContext({
          isLoading: false,
          isSuccess: false,
          isError: true,
          error,
          user: nhost.auth.getUser(),
          isAuthenticated: nhost.auth.isAuthenticated().authenticated,
        });
      }

      if (!session) {
        return setNhostAuthContext({
          isLoading: false,
          isSuccess: false,
          isError: true,
          error: new Error('No session available'),
          user: nhost.auth.getUser(),
          isAuthenticated: nhost.auth.isAuthenticated().authenticated,
        });
      }

      // onAuthStateChange in the provider will set the NhostAuthContext if sign
      // in was successful.

      return { session, error };
    },
    signOut: async () => {
      setNhostAuthContext({
        isLoading: true,
        isSuccess: false,
        isError: true,
        error: new Error('No session available'),
        user: nhost.auth.getUser(),
        isAuthenticated: nhost.auth.isAuthenticated().authenticated,
      });

      // onAuthStateChange in the provider will set the NhostAuthContext if sign
      // in was successful.

      return await nhost.auth.signOut();
    },
    ...nhostAuthContext,
  };

  return ret;
}
