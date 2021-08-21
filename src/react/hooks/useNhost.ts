import { useContext } from 'react';
import { NhostClientContext } from '../context';

export function useNhost() {
  const nhost = useContext(NhostClientContext);
  return { nhost: nhost! };
}
