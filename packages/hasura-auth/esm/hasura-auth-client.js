/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-magic-numbers */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-case-declarations */
/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/no-confusing-void-expression */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/ban-types */
import queryString from 'query-string';
import { HasuraAuthApi } from './hasura-auth-api.js';
import { NHOST_REFRESH_TOKEN } from './utils/constants.js';
import { inMemoryLocalStorage, isBrowser } from './utils/helpers.js';
export class HasuraAuthClient {
    constructor({ url, autoRefreshToken = true, autoLogin = true, refreshIntervalTime, clientStorage, clientStorageType = "web", }) {
        this.refreshIntervalTime = refreshIntervalTime;
        if (!clientStorage) {
            this.clientStorage = isBrowser() ? localStorage : new inMemoryLocalStorage();
        }
        else {
            this.clientStorage = clientStorage;
        }
        this.clientStorageType = clientStorageType;
        this.onTokenChangedFunctions = [];
        this.onAuthChangedFunctions = [];
        this.refreshInterval;
        this.refreshSleepCheckInterval = 0;
        this.refreshIntervalSleepCheckLastSample = Date.now();
        this.sampleRate = 2000; // check every 2 seconds
        this.url = url;
        this.autoRefreshToken = autoRefreshToken;
        this.initAuthLoading = true;
        this.session = null;
        // this.user = null;
        this.api = new HasuraAuthApi({ url: this.url });
        // get refresh token from query param (from external OAuth provider callback)
        let refreshToken = null;
        let autoLoginFromQueryParameters = false;
        // try to auto login using hashtag query parameters
        // ex if the user came from a magic link
        if (autoLogin && isBrowser() && window.location) {
            // try {
            const urlParams = queryString.parse(window.location.toString().split("#")[1]);
            if ("refreshToken" in urlParams) {
                // We must keep this hash becaus it might cause error during double
                // render in dev mode for react
                // https://reactjs.org/docs/strict-mode.html
                // this.clearHashFromUrl();
                refreshToken = urlParams.refreshToken;
            }
            if ("otp" in urlParams && "email" in urlParams) {
                // We must keep this hash becaus it might cause error during double
                // render in dev mode for react
                // https://reactjs.org/docs/strict-mode.html
                // this.clearHashFromUrl();
                const { otp, email } = urlParams;
                // sign in with OTP
                this.signIn({
                    otp: otp,
                    email: email,
                });
                autoLoginFromQueryParameters = true;
            }
        }
        // if empty string, then set it to null
        // refreshToken = refreshToken ? refreshToken : null;
        if (!autoLoginFromQueryParameters && autoLogin) {
            this._autoLogin(refreshToken);
        }
        else if (refreshToken) {
            this._setItem(NHOST_REFRESH_TOKEN, refreshToken);
        }
    }
    /**
     * Use `signUp` to sign up users using email an password.
     *
     * If you want to sign up a user using magic link or a social provider, use
     * the `signIn` function instead.
     *
     * @example
     * auth.signIn({email, password}); // email password
     *
     * @docs https://docs.nhost.io/TODO
     */
    async signUp(params) {
        const { email, password } = params;
        // email and password
        if (email && password) {
            // sign up with email and password
            const { data, error } = await this.api.signUpEmailPassword(params);
            if (error) {
                return { session: null, error };
            }
            if (!data) {
                return {
                    session: null,
                    error: { message: "An error occurred on sign up.", status: 500 },
                };
            }
            const { session } = data;
            if (session) {
                await this._setSession(session);
            }
            return { session, error: null };
        }
        return {
            session: null,
            error: { message: "Incorrect parameters", status: 500 },
        };
    }
    /**
     * Use `signIn` to sign in users using email and password, passwordless
     * (email or sms) or an external provider.
     * `signIn` can be used in various ways depending on the parameters.
     *
     * @example
     * signIn({ email, password }); // Sign in with email and password
     * signIn({ provider }); // Sign in with an external provider (ex Google or Facebook)
     * signIn({ email }); // [step 1/2] Passwordless sign in with Email (Magic Link)
     * signIn({ email, otp }); // [step 2/2] Finish passwordless sign in with email (OTP)
     * signIn({ phoneNumber }); // [step 1/2] Passwordless sign in with SMS
     * signIn({ phoneNumber, otp }); // [step 2/2] Finish passwordless sign in with SMS (OTP)
     *
     * @docs https://docs.nhost.io/TODO
     */
    async signIn(params) {
        if ("provider" in params) {
            const { provider } = params;
            const providerUrl = `${this.url}/signin/provider/${provider}`;
            if (isBrowser()) {
                window.location.href = providerUrl;
            }
            return { providerUrl, provider, session: null, mfa: null, error: null };
        }
        // email password
        if ("email" in params && "password" in params) {
            const { data, error } = await this.api.signInEmailPassword(params);
            if (error) {
                return { session: null, mfa: null, error };
            }
            if (!data) {
                return {
                    session: null,
                    mfa: null,
                    error: { message: "Incorrect Data", status: 500 },
                };
            }
            const { session, mfa } = data;
            if (session) {
                await this._setSession(session);
            }
            return { session, mfa, error: null };
        }
        // passwordless Email (magic link)
        if ("email" in params && !("otp" in params)) {
            const { error } = await this.api.signInPasswordlessEmail(params);
            if (error) {
                return { session: null, mfa: null, error };
            }
            return { session: null, mfa: null, error: null };
        }
        // passwordless SMS
        if ("phoneNumber" in params && !("otp" in params)) {
            const { error } = await this.api.signInPasswordlessSms(params);
            if (error) {
                return { session: null, mfa: null, error };
            }
            return { session: null, mfa: null, error: null };
        }
        // sign in using OTP
        if ("otp" in params) {
            const { data, error } = await this.api.signInPasswordlessSmsOtp(params);
            if (error) {
                return { session: null, mfa: null, error };
            }
            if (!data) {
                return {
                    session: null,
                    mfa: null,
                    error: { message: "Incorrect data", status: 500 },
                };
            }
            const { session, mfa } = data;
            if (session) {
                this._setSession(session);
            }
            return { session, mfa, error: null };
        }
        return {
            session: null,
            mfa: null,
            error: { message: "Incorrect parameters", status: 500 },
        };
    }
    /**
     * Use `signOut` to sign out a user
     *
     * @example
     * signOut();
     *
     * @docs https://docs.nhost.io/TODO
     */
    async signOut(params) {
        const refreshToken = await this._getItem(NHOST_REFRESH_TOKEN);
        this._clearSession();
        const { error } = await this.api.signOut({
            refreshToken,
            all: params === null || params === void 0 ? void 0 : params.all,
        });
        return { error };
    }
    /**
     * Use `verifyEmail` to verify a user's email using a ticket.
     *
     * @example
     * auth.verifyEmail({email, tricket})
     *
     * @docs https://docs.nhost.io/TODO
     */
    async verifyEmail(params) {
        const { data, error } = await this.api.verifyEmail(params);
        return { data, error };
    }
    /**
     * Use `resetPassword` to reset a user's password.
     *
     * @example
     * auth.resetPassword({email})
     *
     * @docs https://docs.nhost.io/TODO
     */
    async resetPassword(params) {
        const { error } = await this.api.resetPassword(params);
        return { error };
    }
    /**
     * Use `changePassword` to change a user's password.
     *
     * @example
     * auth.changePassword({ newPassword })
     *
     * @docs https://docs.nhost.io/TODO
     */
    async changePassword(params) {
        const { error } = await this.api.changePassword(params);
        return { error };
    }
    /**
     * Use `sendVerificationEmail` to send a verification email
     * to the specified email.
     *
     * @example
     * auth.sendVerificationEmail({email})
     *
     * @docs https://docs.nhost.io/TODO
     */
    async sendVerificationEmail(params) {
        const { error } = await this.api.sendVerificationEmail(params);
        return { error };
    }
    /**
     * Use `changeEmail` to change a user's email
     *
     * @example
     * auth.changeEmail({newEmail})
     *
     * @docs https://docs.nhost.io/TODO
     */
    async changeEmail(params) {
        const { error } = await this.api.changeEmail(params);
        return { error };
    }
    /**
     * Use `deanonymize` to deanonymize a user
     *
     * @example
     * auth.deanonymize({signInMethod: 'email-password', email})
     *
     * @docs https://docs.nhost.io/TODO
     */
    async deanonymize(params) {
        const { error } = await this.api.deanonymize(params);
        return { error };
    }
    /**
     * Use `onTokenChanged` to add a custom function that will trigger whenever
     * the access and refresh token is changed.
     *
     * @example
     * auth.onTokenChanged(() => console.log('access token changed'););
     *
     * @docs https://docs.nhost.io/TODO
     */
    onTokenChanged(fn) {
        this.onTokenChangedFunctions.push(fn);
        // get internal index of this function
        const index = this.onTokenChangedFunctions.length - 1;
        const unsubscribe = () => {
            try {
                // replace onTokenChanged with empty function
                this.onTokenChangedFunctions[index] = () => { };
            }
            catch {
                console.warn("Unable to unsubscribe onTokenChanged function. Maybe the functions is already unsubscribed?");
            }
        };
        return unsubscribe;
    }
    /**
     * Use `onAuthStateChanged` to add a custom function that will trigger
     * whenever the state of the user changed. Ex from signed in to signed out or
     * vice versa.
     *
     * @example
     * auth.onAuthStateChanged(({event, session}) => {
     *   console.log(`auth state changed. State is not ${event} with session: ${session}`)
     * });
     *
     * @docs https://docs.nhost.io/TODO
     */
    onAuthStateChanged(fn) {
        this.onAuthChangedFunctions.push(fn);
        // get internal index for this functions
        const index = this.onAuthChangedFunctions.length - 1;
        const unsubscribe = () => {
            try {
                // replace onAuthStateChanged with empty function
                this.onAuthChangedFunctions[index] = () => { };
            }
            catch {
                console.warn("Unable to unsubscribe onAuthStateChanged function. Maybe you already did?");
            }
        };
        return unsubscribe;
    }
    /**
     * Use `isAuthenticated` to check if the user is authenticated or not.
     *
     * Note that `isAuthenticated` can return `false` before the auth status has
     * been resolved. Use `getAuthenticationStatus` to get both loading and auth status.
     *
     *
     * @example
     *
     * const  = auth.isAuthenticated();
     *
     * if (authenticated) {
     *   console.log('User is authenticated');
     * }
     *
     * @docs https://docs.nhost.io/TODO
     */
    isAuthenticated() {
        return this.session !== null;
    }
    /**
     * Use `isAuthenticatedAsync` to wait and check if the user is authenticated or not.
     *
     * @example
     *
     * const isAuthenticated  = awiat auth.isAuthenticatedAsync();
     *
     * if (isAuthenticated) {
     *   console.log('User is authenticated');
     * }
     *
     * @docs https://docs.nhost.io/TODO
     */
    async isAuthenticatedAsync() {
        return new Promise((resolve) => {
            // if init auth loading is already completed, we can return the value of `isAuthenticated`.
            if (!this.initAuthLoading) {
                resolve(this.isAuthenticated());
            }
            // if no, let's subscribe and wait for an auth state change event and
            // resolve the promise when we receive the event
            else {
                const unsubscribe = this.onAuthStateChanged((event, _session) => {
                    resolve(event === "SIGNED_IN");
                    unsubscribe();
                });
            }
        });
    }
    /**
     * Use `getAuthenticationStatus` to get the authentication status of the user.
     *
     * if `isLoading` is true, the auth request is in transit and the SDK does not
     * yet know if the user will be logged in or not.
     *
     *
     * @example
     *
     * const { isAuthenticated, isLoading } = auth.getAuthenticationStatus();
     *
     * if (isLoading) {
     *   console.log('Loading...')
     * }
     *
     * if (isAuthenticated) {
     *   console.log('User is authenticated');
     * }
     *
     * @docs https://docs.nhost.io/TODO
     */
    getAuthenticationStatus() {
        if (this.initAuthLoading)
            return { isAuthenticated: false, isLoading: true };
        return { isAuthenticated: this.session !== null, isLoading: false };
    }
    /**
     * @deprecated Use `getAccessToken()` instead.
     */
    getJWTToken() {
        return this.getAccessToken();
    }
    /**
     *
     * Use `getAccessToken` to get the logged in user's access token.
     *
     * @example
     *
     * const accessToken = auth.getAccessToken();
     *
     * @docs https://docs.nhost.io/TODO
     */
    getAccessToken() {
        if (!this.session) {
            return undefined;
        }
        return this.session.accessToken;
    }
    /**
     *
     * Use `refreshSession()` to refresh the current session or refresh the
     * session with an provided `refreshToken`.
     *
     * @example
     *
     * refreshToken();
     * refreshToken(refreshToken);
     *
     * @docs https://docs.nhost.io/TODO
     */
    async refreshSession(refreshToken) {
        const refreshTokenToUse = refreshToken || (await this._getItem(NHOST_REFRESH_TOKEN));
        if (!refreshTokenToUse) {
            console.warn("no refresh token found. No way of refreshing session");
        }
        return this._refreshTokens(refreshTokenToUse);
    }
    /**
     *
     * Use `getSession()` to get the current session.
     *
     * @example
     *
     * const session = getSession();
     *
     * @docs https://docs.nhost.io/TODO
     */
    getSession() {
        return this.session;
    }
    /**
     *
     * Use `getUser()` to get the current user.
     *
     * @example
     *
     * const user = getUser();
     *
     * @docs https://docs.nhost.io/TODO
     */
    getUser() {
        return this.session ? this.session.user : null;
    }
    async _setItem(key, value) {
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
    async _getItem(key) {
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
                return (await this.clientStorage.getItem(key));
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
                return "";
        }
        return "";
    }
    async _removeItem(key) {
        switch (this.clientStorageType) {
            case "web":
                if (typeof this.clientStorage.removeItem !== "function") {
                    console.error(`this.clientStorage.removeItem is not a function`);
                    break;
                }
                return void this.clientStorage.removeItem(key);
            case "custom":
            case "react-native":
                if (typeof this.clientStorage.removeItem !== "function") {
                    console.error(`this.clientStorage.removeItem is not a function`);
                    break;
                }
                return void this.clientStorage.removeItem(key);
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
    // private _generateHeaders(): Headers | null {
    //   if (!this.session) {
    //     return {};
    //   }
    //   return {
    //     Authorization: `Bearer ${this.session.accessToken}`,
    //   };
    // }
    _autoLogin(refreshToken) {
        // Not sure about this...
        if (!isBrowser()) {
            return;
        }
        // maybe better to use setTimout hack in _refreshTokens because of SSR / Next.js
        // if (!refreshToken) {
        //   this._clearSession();
        //   return;
        // }
        this._refreshTokens(refreshToken);
    }
    async _refreshTokens(paramRefreshToken) {
        const refreshToken = paramRefreshToken || (await this._getItem(NHOST_REFRESH_TOKEN));
        if (!refreshToken) {
            // place at end of call-stack to let frontend get `null` first (to match SSR)
            setTimeout(async () => {
                await this._clearSession();
            }, 0);
            return;
        }
        try {
            // set lock to avoid two refresh token request being sent at the same time with the same token.
            // If so, the last request will fail because the first request used the refresh token
            const { session, error } = await this.api.refreshToken({ refreshToken });
            if (error && error.status === 401) {
                await this._clearSession();
                return;
            }
            if (!session)
                throw new Error("Invalid session data");
            await this._setSession(session);
            this.tokenChanged();
        }
        catch {
            // throw new Error(error);
        }
    }
    tokenChanged() {
        for (const tokenChangedFunction of this.onTokenChangedFunctions) {
            tokenChangedFunction(this.session);
        }
    }
    authStateChanged({ event, session, }) {
        if (event === "SIGNED_IN" && session) {
            this.api.setAccessToken(session.accessToken);
        }
        else {
            this.api.setAccessToken(undefined);
        }
        for (const authChangedFunction of this.onAuthChangedFunctions) {
            authChangedFunction(event, session);
        }
    }
    async _clearSession() {
        // get previous state before clearing the session
        const { isLoading, isAuthenticated } = this.getAuthenticationStatus();
        // clear current session no mather what the previous auth state was
        this.session = null;
        this.initAuthLoading = false;
        await this._removeItem(NHOST_REFRESH_TOKEN);
        // if the user was previously authenticated, clear all intervals and send a
        // state change call to subscribers
        if (isLoading || isAuthenticated) {
            clearInterval(this.refreshInterval);
            clearInterval(this.refreshSleepCheckInterval);
            this.authStateChanged({ event: "SIGNED_OUT", session: null });
        }
    }
    async _setSession(session) {
        const { isAuthenticated } = this.getAuthenticationStatus();
        this.session = session;
        await this._setItem(NHOST_REFRESH_TOKEN, session.refreshToken);
        if (this.autoRefreshToken && !isAuthenticated) {
            // start refresh token interval after logging in
            const JWTExpiresIn = session.accessTokenExpiresIn;
            const refreshIntervalTime = this.refreshIntervalTime
                ? this.refreshIntervalTime
                : Math.max(1, JWTExpiresIn - 1); // 1 min before jwt expires
            this.refreshInterval = setInterval(async () => {
                const refreshToken = await this._getItem(NHOST_REFRESH_TOKEN);
                await this._refreshTokens(refreshToken);
            }, refreshIntervalTime * 1000);
            // refresh token after computer has been sleeping
            // https://stackoverflow.com/questions/14112708/start-calling-js-function-when-pc-wakeup-from-sleep-mode
            this.refreshIntervalSleepCheckLastSample = Date.now();
            this.refreshSleepCheckInterval = setInterval(async () => {
                if (Date.now() - this.refreshIntervalSleepCheckLastSample >= this.sampleRate * 2) {
                    const refreshToken = await this._getItem(NHOST_REFRESH_TOKEN);
                    await this._refreshTokens(refreshToken);
                }
                this.refreshIntervalSleepCheckLastSample = Date.now();
            }, this.sampleRate);
            this.authStateChanged({ event: "SIGNED_IN", session: this.session });
        }
        this.initAuthLoading = false;
    }
}
//# sourceMappingURL=hasura-auth-client.js.map
