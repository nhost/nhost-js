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
  graphqlUrl?: string;
  functionsUrl?: string;
};

export type NhostAuthContextDef = {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  user: User | null;
  isAuthenticated: boolean;
};

export type NhostFunctionsConstructorParams = {
  url: string;
};
