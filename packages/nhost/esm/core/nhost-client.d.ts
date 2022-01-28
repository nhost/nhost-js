import { HasuraAuthClient } from '@nhost/hasura-auth-js';
import { HasuraStorageClient } from '@nhost/hasura-storage-js';
import { ClientStorage, ClientStorageType } from '@nhost/hasura-auth-js';
import { NhostFunctionsClient } from '../clients/functions';
import { NhostGraphqlClient } from '../clients/graphql';
export declare type NhostClientConstructorParams = {
    backendUrl: string;
    refreshIntervalTime?: number;
    clientStorage?: ClientStorage;
    clientStorageType?: ClientStorageType;
    autoRefreshToken?: boolean;
    autoLogin?: boolean;
};
export declare class NhostClient {
    auth: HasuraAuthClient;
    storage: HasuraStorageClient;
    functions: NhostFunctionsClient;
    graphql: NhostGraphqlClient;
    /**
     * Nhost Client
     *
     * @example
     * const nhost = new NhostClient({ url });
     *
     * @docs https://docs.nhost.io/TODO
     */
    constructor(params: NhostClientConstructorParams);
}
//# sourceMappingURL=nhost-client.d.ts.map