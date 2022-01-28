import { ApiChangeEmailResponse, ApiChangePasswordResponse, ApiDeanonymizeResponse, ApiError, ApiResetPasswordResponse, ApiSendVerificationEmailResponse, AuthChangedFunction, ChangeEmailParams, ChangePasswordParams, ClientStorage, ClientStorageType, DeanonymizeParams, OnTokenChangedFunction, ResetPasswordParams, SendVerificationEmailParams, Session, SignInParams, SignUpParams, SignUpResponse } from './utils/types';
export declare class HasuraAuthClient {
    private api;
    private onTokenChangedFunctions;
    private onAuthChangedFunctions;
    private refreshInterval;
    private refreshIntervalTime;
    private clientStorage;
    private clientStorageType;
    private url;
    private autoRefreshToken;
    private session;
    private initAuthLoading;
    private refreshSleepCheckInterval;
    private refreshIntervalSleepCheckLastSample;
    private sampleRate;
    constructor({ url, autoRefreshToken, autoLogin, refreshIntervalTime, clientStorage, clientStorageType, }: {
        url: string;
        autoRefreshToken?: boolean;
        autoLogin?: boolean;
        refreshIntervalTime?: number;
        clientStorage?: ClientStorage;
        clientStorageType?: ClientStorageType;
    });
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
    signUp(params: SignUpParams): Promise<SignUpResponse>;
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
    signIn(params: SignInParams): Promise<{
        session: Session | null;
        mfa: {
            ticket: string;
        } | null;
        error: ApiError | null;
        providerUrl?: string;
        provider?: string;
    }>;
    /**
     * Use `signOut` to sign out a user
     *
     * @example
     * signOut();
     *
     * @docs https://docs.nhost.io/TODO
     */
    signOut(params?: {
        all?: boolean;
    }): Promise<unknown>;
    /**
     * Use `verifyEmail` to verify a user's email using a ticket.
     *
     * @example
     * auth.verifyEmail({email, tricket})
     *
     * @docs https://docs.nhost.io/TODO
     */
    verifyEmail(params: {
        email: string;
        ticket: string;
    }): Promise<unknown>;
    /**
     * Use `resetPassword` to reset a user's password.
     *
     * @example
     * auth.resetPassword({email})
     *
     * @docs https://docs.nhost.io/TODO
     */
    resetPassword(params: ResetPasswordParams): Promise<ApiResetPasswordResponse>;
    /**
     * Use `changePassword` to change a user's password.
     *
     * @example
     * auth.changePassword({ newPassword })
     *
     * @docs https://docs.nhost.io/TODO
     */
    changePassword(params: ChangePasswordParams): Promise<ApiChangePasswordResponse>;
    /**
     * Use `sendVerificationEmail` to send a verification email
     * to the specified email.
     *
     * @example
     * auth.sendVerificationEmail({email})
     *
     * @docs https://docs.nhost.io/TODO
     */
    sendVerificationEmail(params: SendVerificationEmailParams): Promise<ApiSendVerificationEmailResponse>;
    /**
     * Use `changeEmail` to change a user's email
     *
     * @example
     * auth.changeEmail({newEmail})
     *
     * @docs https://docs.nhost.io/TODO
     */
    changeEmail(params: ChangeEmailParams): Promise<ApiChangeEmailResponse>;
    /**
     * Use `deanonymize` to deanonymize a user
     *
     * @example
     * auth.deanonymize({signInMethod: 'email-password', email})
     *
     * @docs https://docs.nhost.io/TODO
     */
    deanonymize(params: DeanonymizeParams): Promise<ApiDeanonymizeResponse>;
    /**
     * Use `onTokenChanged` to add a custom function that will trigger whenever
     * the access and refresh token is changed.
     *
     * @example
     * auth.onTokenChanged(() => console.log('access token changed'););
     *
     * @docs https://docs.nhost.io/TODO
     */
    onTokenChanged(fn: OnTokenChangedFunction): Function;
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
    onAuthStateChanged(fn: AuthChangedFunction): Function;
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
    isAuthenticated(): boolean;
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
    isAuthenticatedAsync(): Promise<boolean>;
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
    getAuthenticationStatus(): {
        isAuthenticated: boolean;
        isLoading: boolean;
    };
    /**
     * @deprecated Use `getAccessToken()` instead.
     */
    getJWTToken(): string | undefined;
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
    getAccessToken(): string | undefined;
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
    refreshSession(refreshToken?: string): Promise<void>;
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
    getSession(): Session | null;
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
    getUser(): import("./utils/types").User | null;
    private _setItem;
    private _getItem;
    private _removeItem;
    private _autoLogin;
    private _refreshTokens;
    private tokenChanged;
    private authStateChanged;
    private _clearSession;
    private _setSession;
}
//# sourceMappingURL=hasura-auth-client.d.ts.map