import { HasuraAuthClient } from '@nhost/hasura-auth-js';
import { HasuraStorageClient } from '@nhost/hasura-storage-js';

import { NhostClientConstructorParams } from '../types';

export class NhostClient {
  auth: HasuraAuthClient;
  storage: HasuraStorageClient;

  private graphqlUrl: string;
  private functionsUrl: string;

  /**
   * Nhost Client
   *
   * @example
   * const nhost = new NhostClient({ url });
   *
   * @docs https://docs.nhost.io/TODO
   */
  constructor(params: NhostClientConstructorParams) {
    if (!params.url) throw 'Please specify a `url`. Docs: TODO.';

    const {
      url,
      refreshIntervalTime,
      clientStorage,
      clientStorageType,
      autoRefreshToken,
      autoLogin,
      authUrl,
      storageUrl,
      graphqlUrl,
      functionsUrl,
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

    this.graphqlUrl = graphqlUrl ? graphqlUrl : `${url}/v1/graphql`;
    this.functionsUrl = functionsUrl ? functionsUrl : `${url}/v1/functions`;
  }

  public getGraphqlUrl(): string {
    return this.graphqlUrl;
  }

  public getFunctionsUrl(): string {
    return this.functionsUrl;
  }
}
