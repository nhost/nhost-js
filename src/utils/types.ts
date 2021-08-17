import { ClientStorage, ClientStorageType } from '@nhost/hasura-auth-js';

export type NhostClientConstructorParams = {
  url: string;
  refreshIntervalTime?: number;
  clientStorage?: ClientStorage;
  clientStorageType?: ClientStorageType;
  autoRefreshToken?: boolean;
  autoLogin?: boolean;
};
