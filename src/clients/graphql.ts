import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export type NhostGraphqlConstructorParams = {
  url: string;
};

export class NhostGraphqlClient {
  private url: string;
  private instance: AxiosInstance;
  private accessToken: string | null;

  constructor(params: NhostGraphqlConstructorParams) {
    const { url } = params;

    this.url = url;
    this.accessToken = null;
    this.instance = axios.create({
      baseURL: url,
      timeout: 5000,
    });
  }

  public async request(
    document: string,
    variables?: any,
    config?: AxiosRequestConfig
  ) {
    // add auth headers if any
    const headers = {
      ...config?.headers,
      ...this.generateAccessTokenHeaders(),
    };

    const operationName = '';

    const { data } = await this.instance.post(
      '',
      {
        operationName: operationName ? operationName : undefined,
        query: document,
        variables,
      },
      { ...config, headers }
    );

    return data;
  }

  public getUrl(): string {
    return `${this.url}/v1/graphql`;
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
