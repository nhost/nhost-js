import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { NhostFunctionsConstructorParams } from '../types';

export class NhostFunctionsClient {
  private instance: AxiosInstance;
  private accessToken: string | null;

  constructor(params: NhostFunctionsConstructorParams) {
    const { url } = params;

    this.accessToken = null;
    this.instance = axios.create({
      baseURL: url,
      timeout: 5000,
      headers: { 'X-Custom-Header': 'foobar' },
    });
  }

  public post(url: string, data: any, config?: AxiosRequestConfig) {
    const headers = {
      ...config?.headers,
      ...this.generateAccessTokenHeaders(),
    };

    return this.instance.post(url, data, { ...config, headers });
  }

  public call(url: string, data: any, config: AxiosRequestConfig) {
    return this.post(url, data, config);
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
      return {};
    }

    return {
      Authorization: `Bearer ${this.accessToken}`,
    };
  }
}
