import { HasuraAuthClient } from '@nhost/hasura-auth-js';
import { HasuraStorageClient } from '@nhost/hasura-storage-js';
import { NhostFunctionsClient } from '../clients/functions';

import { NhostClientConstructorParams } from '../types';

export class NhostClient {
  auth: HasuraAuthClient;
  storage: HasuraStorageClient;
  functions: NhostFunctionsClient;

  private graphqlUrl: string;

  /**
   * Nhost Client
   *
   * @example
   * const nhost = new NhostClient({ url });
   *
   * @docs https://docs.nhost.io/TODO
   */
  constructor(params: NhostClientConstructorParams) {
    if (!params.url) throw 'Please specify a `url`. Docs: [todo]!';

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

    this.functions = new NhostFunctionsClient({
      url: functionsUrl ? functionsUrl : `${url}/functions`,
    });

    // set current token if token is already accessable
    this.storage.setAccessToken(this.auth.getAccessToken());
    this.functions.setAccessToken(this.auth.getAccessToken());

    // update access token for clients
    this.auth.onAuthStateChanged((_event, session) => {
      this.storage.setAccessToken(session?.accessToken);
      this.functions.setAccessToken(session?.accessToken);
    });

    // update access token for clients
    this.auth.onTokenChanged((session) => {
      this.storage.setAccessToken(session?.accessToken);
      this.functions.setAccessToken(session?.accessToken);
    });

    this.graphqlUrl = graphqlUrl ? graphqlUrl : `${url}/graphql`;
  }

  public getGraphqlUrl(): string {
    return this.graphqlUrl;
  }
}