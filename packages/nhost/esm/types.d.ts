import { AxiosResponse } from 'axios';
export declare type GraphqlRequestResponse = {
    data: unknown;
    error: null;
} | {
    data: null;
    error: Error | object;
};
export declare type FunctionCallResponse = {
    res: AxiosResponse;
    error: null;
} | {
    res: null;
    error: Error;
};
export declare type GraphqlResponse = {
    errors?: object[];
    data?: object;
};
//# sourceMappingURL=types.d.ts.map