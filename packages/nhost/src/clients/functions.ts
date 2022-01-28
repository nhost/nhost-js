import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { FunctionCallResponse } from '../types';

export type NhostFunctionsConstructorParams = {
  url: string;
};

export class NhostFunctionsClient {
  private instance: AxiosInstance;
  private accessToken: string | null;

  constructor(params: NhostFunctionsConstructorParams) {
    const { url } = params;

    this.accessToken = null;
    this.instance = axios.create({
      baseURL: url,
    });
  }

  public async call(
    url: string,
    data: any,
    config?: AxiosRequestConfig
  ): Promise<FunctionCallResponse> {
    const headers = {
      ...this.generateAccessTokenHeaders(),
      ...config?.headers,
    };

    let res;
    try {
      res = await this.instance.post(url, data, { ...config, headers });
    } catch (error) {
      if (error instanceof Error) {
        return { res: null, error };
      }
    }

    if (!res) {
      return {
        res: null,
        error: Error('Unable to make post request to funtion'),
      };
    }

    return { res, error: null };
  }

  public setAccessToken(accessToken: string | undefined) {
    if (!accessToken) {
      this.accessToken = null;
      return;
    }

    this.accessToken = accessToken;
  }

  private generateAccessTokenHeaders() {
    if (!this.accessToken) {
      return;
    }

    return {
      Authorization: `Bearer ${this.accessToken}`,
    };
  }
}
