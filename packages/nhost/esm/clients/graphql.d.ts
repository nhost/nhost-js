import { AxiosRequestConfig } from 'axios';
import { GraphqlRequestResponse } from '../types';
export declare type NhostGraphqlConstructorParams = {
    url: string;
};
export declare class NhostGraphqlClient {
    private url;
    private instance;
    private accessToken;
    constructor(params: NhostGraphqlConstructorParams);
    request(document: string, variables?: any, config?: AxiosRequestConfig): Promise<GraphqlRequestResponse>;
    getUrl(): string;
    setAccessToken(accessToken: string | undefined): void;
    private generateAccessTokenHeaders;
}
//# sourceMappingURL=graphql.d.ts.map