import { ClientStorage, ClientStorageType, User } from '@nhost/hasura-auth-js';
import { NhostClient } from './core';

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

export type NhostContextDef = {
  client: NhostClient | null;
  auth: NhostAuthContext;
};

export type NhostAuthContext = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};
