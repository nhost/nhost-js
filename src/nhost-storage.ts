import axios, { AxiosInstance } from "axios";
import UserSession from "user-session";
// should import @nhost/hasura-auth-js

import * as types from "./types";

type NhostStorageConfig = {
  baseURL: string;
  userSession: UserSession;
};

type UploadOptions = {
  file: string | Blob | File;
  bucket: string;
  onUploadProgress?: Function;
};

export default class Storage {
  public user: types.User | null;

  private httpClient: AxiosInstance;

  private baseURL: string;
  private userSession: UserSession;

  constructor(config: NhostStorageConfig) {
    const { baseURL, userSession } = config;

    this.user = null;

    this.baseURL = baseURL;
    console.log({ baseURL });
    this.userSession = userSession;

    this.httpClient = axios.create({
      baseURL: `http://localhost:4001/`,
      timeout: 10000,
      headers: {
        lol: this.baseURL,
      },
    });
  }

  public async upload(options: UploadOptions) {
    const { file, bucket } = options;

    let formData = new FormData();
    formData.append("file", file);

    return await this.httpClient.post(`/`, formData, {
      headers: {
        "x-bucket-id": bucket,
        ...this.generateAuthorizationHeader(),
      },
    });
  }

  public async delete({ fileId }: { fileId: string }) {
    return await this.httpClient.delete(`/${fileId}`, {
      headers: {
        ...this.generateAuthorizationHeader(),
      },
    });
  }

  public async getPresignedUrl(options: {
    fileId: string;
  }): Promise<{ url: string; expire: number }> {
    const { fileId } = options;
    const res = await this.httpClient.get(`/presignedurl/${fileId}`, {
      headers: {
        ...this.generateAuthorizationHeader(),
      },
    });

    console.log("res data:");
    console.log(res.data);

    return res.data;
  }

  private generateAuthorizationHeader(): null | types.Headers {
    const JWTToken = this.userSession.getSession()?.accessToken;

    if (JWTToken) {
      return {
        Authorization: `Bearer ${JWTToken}`,
      };
    } else {
      return null;
    }
  }
}
