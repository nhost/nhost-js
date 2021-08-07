import axios, { AxiosInstance } from "axios";
// should import @nhost/hasura-auth-js
import queryString from "query-string";

type ChangePasswordOptions = {
  oldPassword?: string;
  ticket?: string;
  newPassword: string;
};

import * as types from "./types";
import UserSession from "./user-session";

export type AuthChangedFunction = (isAuthenticated: boolean) => void;

export default class Auth {
  public user: types.User | null;

  private httpClient: AxiosInstance;
  private tokenChangedFunctions: Function[];
  private authChangedFunctions: AuthChangedFunction[];

  private refreshInterval: any;
  private refreshIntervalTime: number | null;
  private clientStorage: types.ClientStorage;
  private clientStorageType: string;

  private ssr: boolean | undefined;
  private refreshTokenLock: boolean;
  private baseURL: string;
  private currentSession: UserSession;
  private loading: boolean;
  private refreshSleepCheckInterval: any;
  private refreshIntervalSleepCheckLastSample: number;
  private sampleRate: number;

  constructor(config: types.AuthConfig, session: UserSession) {
    const {
      baseURL,
      refreshIntervalTime,
      clientStorage,
      clientStorageType,
      ssr,
    } = config;

    this.user = null;

    this.refreshIntervalTime = refreshIntervalTime;
    this.clientStorage = clientStorage;
    this.clientStorageType = clientStorageType;
    this.tokenChangedFunctions = [];
    this.authChangedFunctions = [];
    this.refreshInterval;

    this.refreshSleepCheckInterval = 0;
    this.refreshIntervalSleepCheckLastSample = Date.now();
    this.sampleRate = 2000; // check every 2 seconds
    this.ssr = ssr;

    this.refreshTokenLock = false;
    this.baseURL = baseURL;
    this.loading = true;

    this.currentSession = session;

    this.httpClient = axios.create({
      baseURL: `${this.baseURL}/`,
      timeout: 10000,
    });

    // get refresh token from query param (from external OAuth provider callback)
    let refreshToken: string | null = null;

    if (!ssr) {
      try {
        const parsed = queryString.parse(window.location.search);
        refreshToken =
          "refreshToken" in parsed ? (parsed.refreshToken as string) : null;

        if (refreshToken) {
          let newURL = this._removeParam("refreshToken", window.location.href);
          try {
            window.history.pushState({}, document.title, newURL);
          } catch {
            // noop
            // window object not available
          }
        }
      } catch (e) {
        // noop. `window` not available probably.
      }
    }

    // if empty string, then set it to null
    refreshToken = refreshToken ? refreshToken : null;

    this._autoLogin(refreshToken);
  }

  // public user(): types.User | null {
  //   return this.currentUser;
  // }

  public async signUp({
    email,
    password,
    options = {},
  }: types.UserCredentials): Promise<{
    session: types.Session | null;
    user: types.User;
  }> {
    const { userData, defaultRole, allowedRoles } = options;

    const registerOptions =
      defaultRole || allowedRoles
        ? {
            default_role: defaultRole,
            allowed_roles: allowedRoles,
          }
        : undefined;

    let res;
    try {
      res = await this.httpClient.post("/signup/email-password", {
        email,
        password,
        user_data: userData,
        register_options: registerOptions,
      });
    } catch (error) {
      throw error;
    }

    if (res.data.jwt_token) {
      this._setSession(res.data);

      return { session: res.data, user: res.data.user };
    } else {
      // if AUTO_ACTIVATE_NEW_USERS is false
      return { session: null, user: res.data.user };
    }
  }

  public async signIn({
    email,
    password,
    provider,
  }: types.UserCredentials): Promise<{
    session: types.Session | null;
    user: types.User | null;
    mfa?: {
      ticket: string;
    };
    magicLink?: true;
  }> {
    if (provider) {
      window.location.href = `${this.baseURL}/signin/provider/${provider}`;
      return { session: null, user: null };
    }

    let res;
    try {
      res = await this.httpClient.post("/signin/email-password", {
        email,
        password,
      });
    } catch (error) {
      this._clearSession();
      throw error;
    }

    // if ("mfa" in res.data) {
    //   return { session: null, user: null, mfa: { ticket: res.data.ticket } };
    // }

    if ("magicLink" in res.data) {
      return { session: null, user: null, magicLink: true };
    }

    console.log("set session");
    console.log(res.data);

    this._setSession(res.data);

    return { session: res.data, user: res.data.user };
  }

  public async logout(all: boolean = false): Promise<{
    session: null;
    user: null;
  }> {
    try {
      await this.httpClient.post(
        "/logout",
        {
          all,
        },
        {
          params: {
            refreshToken: await this._getItem("nhostRefreshToken"),
          },
        }
      );
    } catch (error) {
      // throw error;
      // noop
    }

    this._clearSession();

    return { session: null, user: null };
  }

  public async changePassword(options: ChangePasswordOptions) {
    return await this.httpClient.post("/user/password", options, {
      headers: {
        Authorization: `Bearer ${this.getJWTToken()}`,
      },
    });
  }

  public async verifyEmail(options: { ticket: string; email: string }) {
    const res = await this.httpClient.post("/user/email/verify", options);
    return res.data;
  }

  public async passwordReset({ email }: { email: string }) {
    return await this.httpClient.post("/user/password/reset", { email });
  }

  public onTokenChanged(fn: Function): Function {
    this.tokenChangedFunctions.push(fn);

    // get index;
    const tokenChangedFunctionIndex = this.tokenChangedFunctions.length - 1;

    const unsubscribe = () => {
      try {
        // replace onTokenChanged with empty function
        this.tokenChangedFunctions[tokenChangedFunctionIndex] = () => {};
      } catch (err) {
        console.warn(
          "Unable to unsubscribe onTokenChanged function. Maybe you already did?"
        );
      }
    };

    return unsubscribe;
  }

  public onAuthStateChanged(fn: AuthChangedFunction): Function {
    this.authChangedFunctions.push(fn);

    // get index;
    const authStateChangedFunctionIndex = this.authChangedFunctions.length - 1;

    const unsubscribe = () => {
      try {
        // replace onAuthStateChanged with empty function
        this.authChangedFunctions[authStateChangedFunctionIndex] = () => {};
      } catch (err) {
        console.warn(
          "Unable to unsubscribe onAuthStateChanged function. Maybe you already did?"
        );
      }
    };

    return unsubscribe;
  }

  public isAuthenticated(): boolean | null {
    if (this.loading) return null;
    return this.currentSession.getSession() !== null;
  }

  public isAuthenticatedAsync(): Promise<boolean> {
    const isAuthenticated = this.isAuthenticated();

    return new Promise((resolve) => {
      if (isAuthenticated !== null) resolve(isAuthenticated);
      else {
        const unsubscribe = this.onAuthStateChanged((isAuthenticated) => {
          resolve(isAuthenticated);
          unsubscribe();
        });
      }
    });
  }

  public getJWTToken(): string | null {
    return this.currentSession.getSession()?.accessToken || null;
  }

  public getClaim(claim: string): string | string[] | null {
    return this.currentSession.getClaim(claim);
  }

  public async refreshSession(): Promise<void> {
    return await this._refreshToken();
  }

  private _removeParam(key: string, sourceURL: string) {
    var rtn = sourceURL.split("?")[0],
      param,
      params_arr = [],
      queryString =
        sourceURL.indexOf("?") !== -1 ? sourceURL.split("?")[1] : "";
    if (queryString !== "") {
      params_arr = queryString.split("&");
      for (var i = params_arr.length - 1; i >= 0; i -= 1) {
        param = params_arr[i].split("=")[0];
        if (param === key) {
          params_arr.splice(i, 1);
        }
      }
      if (params_arr.length > 0) {
        rtn = rtn + "?" + params_arr.join("&");
      }
    }
    return rtn;
  }

  private async _setItem(key: string, value: string): Promise<void> {
    if (typeof value !== "string") {
      console.error(`value is not of type "string"`);
      return;
    }

    switch (this.clientStorageType) {
      case "web":
        if (typeof this.clientStorage.setItem !== "function") {
          console.error(`this.clientStorage.setItem is not a function`);
          break;
        }
        this.clientStorage.setItem(key, value);
        break;
      case "custom":
      case "react-native":
        if (typeof this.clientStorage.setItem !== "function") {
          console.error(`this.clientStorage.setItem is not a function`);
          break;
        }
        await this.clientStorage.setItem(key, value);
        break;
      case "capacitor":
        if (typeof this.clientStorage.set !== "function") {
          console.error(`this.clientStorage.set is not a function`);
          break;
        }
        await this.clientStorage.set({ key, value });
        break;
      case "expo-secure-storage":
        if (typeof this.clientStorage.setItemAsync !== "function") {
          console.error(`this.clientStorage.setItemAsync is not a function`);
          break;
        }
        this.clientStorage.setItemAsync(key, value);
        break;
      default:
        break;
    }
  }

  private async _getItem(key: string): Promise<unknown> {
    switch (this.clientStorageType) {
      case "web":
        if (typeof this.clientStorage.getItem !== "function") {
          console.error(`this.clientStorage.getItem is not a function`);
          break;
        }
        return this.clientStorage.getItem(key);
      case "custom":
      case "react-native":
        if (typeof this.clientStorage.getItem !== "function") {
          console.error(`this.clientStorage.getItem is not a function`);
          break;
        }
        return await this.clientStorage.getItem(key);
      case "capacitor":
        if (typeof this.clientStorage.get !== "function") {
          console.error(`this.clientStorage.get is not a function`);
          break;
        }
        const res = await this.clientStorage.get({ key });
        return res.value;
      case "expo-secure-storage":
        if (typeof this.clientStorage.getItemAsync !== "function") {
          console.error(`this.clientStorage.getItemAsync is not a function`);
          break;
        }
        return this.clientStorage.getItemAsync(key);
      default:
        break;
    }
  }

  private async _removeItem(key: string): Promise<void> {
    switch (this.clientStorageType) {
      case "web":
        if (typeof this.clientStorage.removeItem !== "function") {
          console.error(`this.clientStorage.removeItem is not a function`);
          break;
        }
        return this.clientStorage.removeItem(key);
      case "custom":
      case "react-native":
        if (typeof this.clientStorage.removeItem !== "function") {
          console.error(`this.clientStorage.removeItem is not a function`);
          break;
        }
        return await this.clientStorage.removeItem(key);
      case "capacitor":
        if (typeof this.clientStorage.remove !== "function") {
          console.error(`this.clientStorage.remove is not a function`);
          break;
        }
        await this.clientStorage.remove({ key });
        break;
      case "expo-secure-storage":
        if (typeof this.clientStorage.deleteItemAsync !== "function") {
          console.error(`this.clientStorage.deleteItemAsync is not a function`);
          break;
        }
        this.clientStorage.deleteItemAsync(key);
        break;
      default:
        break;
    }
  }

  private _autoLogin(refreshToken: string | null): void {
    if (this.ssr) {
      return;
    }

    this._refreshToken(refreshToken);
  }

  private async _refreshToken(initRefreshToken?: string | null): Promise<void> {
    const refreshToken =
      initRefreshToken || (await this._getItem("nhostRefreshToken"));

    if (!refreshToken) {
      // place at end of call-stack to let frontend get `null` first (to match SSR)
      setTimeout(() => {
        this._clearSession();
      }, 0);

      return;
    }

    let res;
    try {
      // set lock to avoid two refresh token request being sent at the same time with the same token.
      // If so, the last request will fail because the first request used the refresh token
      if (this.refreshTokenLock) {
        return;
      }
      this.refreshTokenLock = true;

      // make refresh token request
      res = await this.httpClient.post("/token", {
        refreshToken: refreshToken,
      });
    } catch (error) {
      if (error.response?.status === 401) {
        await this.logout();
        return;
      } else {
        return; // silent fail
      }
    } finally {
      // release lock
      this.refreshTokenLock = false;
    }

    this._setSession(res.data);
    this.tokenChanged();
  }

  private tokenChanged(): void {
    for (const tokenChangedFunction of this.tokenChangedFunctions) {
      tokenChangedFunction();
    }
  }

  private authStateChanged(state: boolean): void {
    for (const authChangedFunction of this.authChangedFunctions) {
      authChangedFunction(state);
    }
  }

  private async _clearSession(): Promise<void> {
    // early exit
    // must be === false and not !this.isAuth.. because isAuth.. can return null
    if (this.isAuthenticated() === false) {
      return;
    }

    clearInterval(this.refreshInterval);
    clearInterval(this.refreshSleepCheckInterval);

    this.currentSession.clearSession();
    this._removeItem("nhostRefreshToken");

    this.loading = false;
    this.authStateChanged(false);
  }

  private async _setSession(session: types.Session) {
    const previouslyAuthenticated = this.isAuthenticated();
    this.currentSession.setSession(session);

    this.user = session.user;

    if (session.refreshToken) {
      await this._setItem("nhostRefreshToken", session.refreshToken);
    }

    if (!previouslyAuthenticated) {
      // start refresh token interval after logging in
      const { accessTokenExpiresIn } = session;
      const refreshIntervalTime = this.refreshIntervalTime
        ? this.refreshIntervalTime
        : Math.max(30 * 1000, accessTokenExpiresIn - 45000); //45 sec before expires
      this.refreshInterval = setInterval(
        this._refreshToken.bind(this),
        refreshIntervalTime
      );

      // refresh token after computer has been sleeping
      // https://stackoverflow.com/questions/14112708/start-calling-js-function-when-pc-wakeup-from-sleep-mode
      this.refreshIntervalSleepCheckLastSample = Date.now();
      this.refreshSleepCheckInterval = setInterval(() => {
        if (
          Date.now() - this.refreshIntervalSleepCheckLastSample >=
          this.sampleRate * 2
        ) {
          this._refreshToken();
        }
        this.refreshIntervalSleepCheckLastSample = Date.now();
      }, this.sampleRate);

      this.authStateChanged(true);
    }

    this.loading = false;
  }
}
