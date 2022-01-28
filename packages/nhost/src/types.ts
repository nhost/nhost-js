import { AxiosResponse } from 'axios';

export type GraphqlRequestResponse =
  | {
      data: unknown;
      error: null;
    }
  | {
      data: null;
      error: Error | object;
    };

export type FunctionCallResponse =
  | {
      res: AxiosResponse;
      error: null;
    }
  | {
      res: null;
      error: Error;
    };

export type GraphqlResponse = {
  errors?: object[];
  data?: object;
};
