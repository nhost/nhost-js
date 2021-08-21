import { ClientStorage, ClientStorageType, User } from '@nhost/hasura-auth-js';

export type NhostClientConstructorParams = {
  url: string;
  refreshIntervalTime?: number;
  clientStorage?: ClientStorage;
  clientStorageType?: ClientStorageType;
  autoRefreshToken?: boolean;
  autoLogin?: boolean;
  authUrl?: string;
  storageUrl?: string;
};

export type NhostAuthContextDef = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};
