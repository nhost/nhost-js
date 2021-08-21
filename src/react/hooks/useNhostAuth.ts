import { useContext } from 'react';
import { NhostContext } from '../context';

export function useNhostAuth() {
  const nhostContext = useContext(NhostContext);

  const nhostAuthContext = {
    signUp: nhostContext.client?.auth.signUp,
    signIn: nhostContext.client?.auth.signIn,
    signOut: nhostContext.client?.auth.signOut,
    ...nhostContext.auth,
  };

  return nhostAuthContext;
}
