import NhostAuth from "./nhost-auth";
import * as types from "./types";
import UserSession from "./user-session";

export default class NhostClient {
  protected baseURL: string;
  private refreshIntervalTime: number | null;
  private clientStorage: types.ClientStorage;
  private clientStorageType: string;
  private ssr: boolean;
  private session: UserSession;

  auth: NhostAuth;

  constructor(config: types.NhostConfig) {
    if (!config.baseURL)
      throw "Please specify a baseURL. Docs: https://docs.nhost.io/libraries/nhost-js-sdk#setup.";

    this.baseURL = config.baseURL;
    this.ssr = config.ssr ?? typeof window === "undefined";

    this.session = new UserSession();
    this.refreshIntervalTime = config.refreshIntervalTime || null; // 10 minutes (600 seconds)

    this.clientStorage = this.ssr
      ? {}
      : config.clientStorage || window.localStorage;

    this.clientStorageType = config.clientStorageType
      ? config.clientStorageType
      : "web";

    this.auth = new NhostAuth(
      {
        baseURL: this.baseURL,
        refreshIntervalTime: this.refreshIntervalTime,
        clientStorage: this.clientStorage,
        clientStorageType: this.clientStorageType,
        ssr: this.ssr,
      },
      this.session
    );
  }
}
