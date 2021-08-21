import { HasuraAuthClient } from '@nhost/hasura-auth-js';
import { HasuraStorageClient } from '@nhost/hasura-storage-js';

import { NhostClientConstructorParams } from '../types';

export class NhostClient {
  auth: HasuraAuthClient;
  storage: HasuraStorageClient;

  constructor(params: NhostClientConstructorParams) {
    if (!params.url) throw 'Please specify a baseURL. Docs: TODO.';

    const {
      url,
      refreshIntervalTime,
      clientStorage,
      clientStorageType,
      autoRefreshToken,
      autoLogin,
      authUrl,
      storageUrl,
    } = params;

    this.auth = new HasuraAuthClient({
      url: authUrl ? authUrl : `${url}/auth`,
      refreshIntervalTime,
      clientStorage,
      clientStorageType,
      autoRefreshToken,
      autoLogin,
    });

    this.storage = new HasuraStorageClient({
      url: storageUrl ? storageUrl : `${url}/storage`,
    });

    // set current token if token is already accessable
    this.storage.setAccessToken(this.auth.getAccessToken());

    // update access token for storage
    this.auth.onAuthStateChanged((_event, session) => {
      this.storage.setAccessToken(session?.accessToken);
    });
  }
}
