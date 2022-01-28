import { AxiosRequestConfig } from 'axios';
import { FunctionCallResponse } from '../types';
export declare type NhostFunctionsConstructorParams = {
    url: string;
};
export declare class NhostFunctionsClient {
    private instance;
    private accessToken;
    constructor(params: NhostFunctionsConstructorParams);
    call(url: string, data: any, config?: AxiosRequestConfig): Promise<FunctionCallResponse>;
    setAccessToken(accessToken: string | undefined): void;
    private generateAccessTokenHeaders;
}
//# sourceMappingURL=functions.d.ts.map