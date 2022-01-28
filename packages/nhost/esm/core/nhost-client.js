import { HasuraAuthClient } from '@nhost/hasura-auth-js';
import { HasuraStorageClient } from '@nhost/hasura-storage-js';
import { NhostFunctionsClient } from '../clients/functions.js';
import { NhostGraphqlClient } from '../clients/graphql.js';
export class NhostClient {
    /**
     * Nhost Client
     *
     * @example
     * const nhost = new NhostClient({ url });
     *
     * @docs https://docs.nhost.io/TODO
     */
    constructor(params) {
        if (!params.backendUrl)
            throw "Please specify a `backendUrl`. Docs: [todo]!";
        const { backendUrl, refreshIntervalTime, clientStorage, clientStorageType, autoRefreshToken, autoLogin, } = params;
        this.auth = new HasuraAuthClient({
            url: `${backendUrl}/v1/auth`,
            refreshIntervalTime,
            clientStorage,
            clientStorageType,
            autoRefreshToken,
            autoLogin,
        });
        this.storage = new HasuraStorageClient({
            url: `${backendUrl}/v1/storage`,
        });
        this.functions = new NhostFunctionsClient({
            url: `${backendUrl}/v1/functions`,
        });
        this.graphql = new NhostGraphqlClient({
            url: `${backendUrl}/v1/graphql`,
        });
        // set current token if token is already accessable
        this.storage.setAccessToken(this.auth.getAccessToken());
        this.functions.setAccessToken(this.auth.getAccessToken());
        this.graphql.setAccessToken(this.auth.getAccessToken());
        // update access token for clients
        this.auth.onAuthStateChanged((_event, session) => {
            this.storage.setAccessToken(session === null || session === void 0 ? void 0 : session.accessToken);
            this.functions.setAccessToken(session === null || session === void 0 ? void 0 : session.accessToken);
            this.graphql.setAccessToken(session === null || session === void 0 ? void 0 : session.accessToken);
        });
        // update access token for clients
        this.auth.onTokenChanged((session) => {
            this.storage.setAccessToken(session === null || session === void 0 ? void 0 : session.accessToken);
            this.functions.setAccessToken(session === null || session === void 0 ? void 0 : session.accessToken);
            this.graphql.setAccessToken(session === null || session === void 0 ? void 0 : session.accessToken);
        });
    }
}
//# sourceMappingURL=nhost-client.js.map
