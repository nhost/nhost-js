import { useContext } from 'react';
import { NhostAuthContext } from '../context';

export function useNhostAuth() {
  return useContext(NhostAuthContext);
}
