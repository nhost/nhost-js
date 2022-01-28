export interface User {
    id: string;
    createdAt: string;
    displayName: string;
    avatarUrl: string;
    locale: string;
    email?: string;
    isAnonymous: boolean;
    defaultRole: string;
    roles: Record<string, string>;
}
export interface Session {
    accessToken: string;
    accessTokenExpiresIn: number;
    refreshToken: string;
    user: User | null;
}
export interface ApiError {
    message: string;
    status: number;
}
export interface SignUpEmailPasswordParams {
    email: string;
    password: string;
    options?: {
        locale?: string;
        allowedRoles?: string[];
        defaultRole?: string;
        displayName?: string;
        redirectTo?: string;
    };
}
export declare type SignUpParams = SignUpEmailPasswordParams;
export declare type SignUpResponse = {
    session: null;
    error: ApiError;
} | {
    session: Session | null;
    error: null;
};
export interface SignInEmailPasswordParams {
    email: string;
    password: string;
}
export interface SignInPasswordlessEmailParams {
    email: string;
    options?: {
        locale?: string;
        allowedRoles?: string[];
        defaultRole?: string;
        displayName?: string;
        redirectTo?: string;
    };
}
export interface SignInPasswordlessSmsParams {
    phoneNumber: string;
    options?: {
        locale?: string;
        allowedRoles?: string[];
        defaultRole?: string;
        displayName?: string;
        redirectTo?: string;
    };
}
export interface SignInPasswordlessSmsOtpParams {
    phoneNumber: string;
    otp: string;
}
export declare type Provider = 'apple' | 'facebook' | 'github' | 'google' | 'linkedin' | 'spotify' | 'twitter' | 'windowslive';
export interface SignInWithProviderOptions {
    provider: Provider;
    options?: {
        locale?: string;
        allowedRoles?: string[];
        defaultRole?: string;
        displayName?: string;
        redirectTo?: string;
    };
}
export declare type SignInParams = SignInEmailPasswordParams | SignInPasswordlessEmailParams | SignInPasswordlessSmsOtpParams | SignInPasswordlessSmsParams | SignInWithProviderOptions;
export interface ResetPasswordParams {
    email: string;
    options?: {
        redirectTo?: string;
    };
}
export interface ChangePasswordParams {
    newPassword: string;
}
export interface SendVerificationEmailParams {
    email: string;
    options?: {
        redirectTo?: string;
    };
}
export interface ChangeEmailParams {
    newEmail: string;
    options?: {
        redirectTo?: string;
    };
}
export interface DeanonymizeParams {
    signInMethod: 'email-password' | 'passwordless';
    email: string;
    password?: string;
    connection?: 'email' | 'sms';
    defaultRole?: string;
    allowedRoles?: string[];
}
export interface SignInReponse {
    session: Session | null;
    error: ApiError | null;
    mfa?: {
        enabled: boolean;
        ticket: string;
    };
    providerUrl?: string;
    provider?: string;
}
export interface ClientStorage {
    setItem?: (_key: string, _value: string) => void;
    getItem?: (key: string) => any;
    removeItem?: (key: string) => void;
    set?: (options: {
        key: string;
        value: string;
    }) => void;
    get?: (options: {
        key: string;
    }) => any;
    remove?: (options: {
        key: string;
    }) => void;
    setItemAsync?: (key: string, value: string) => void;
    getItemAsync?: (key: string) => any;
    deleteItemAsync?: (key: string) => void;
}
export declare type ClientStorageType = 'capacitor' | 'custom' | 'expo-secure-storage' | 'localStorage' | 'react-native' | 'web';
export declare type AuthChangeEvent = 'SIGNED_IN' | 'SIGNED_OUT';
export declare type AuthChangedFunction = (event: AuthChangeEvent, session: Session | null) => void;
export declare type OnTokenChangedFunction = (session: Session | null) => void;
export interface LoginData {
    mfa?: boolean;
    ticket?: string;
}
export interface Headers {
    Authorization?: string;
}
export interface JWTHasuraClaims {
    [claim: string]: string[] | string;
    'x-hasura-allowed-roles': string[];
    'x-hasura-default-role': string;
    'x-hasura-user-id': string;
}
export interface JWTClaims {
    sub?: string;
    iat?: number;
    'https://hasura.io/jwt/claims': JWTHasuraClaims;
}
export interface Mfa {
    ticket: string;
}
export declare type ApiSignUpEmailPasswordResponse = {
    session: null;
    error: ApiError;
} | {
    session: Session;
    error: null;
};
export interface ApiSignInData {
    session: Session;
    mfa: Mfa | null;
}
export declare type ApiSignInResponse = {
    data: ApiSignInData;
    error: null;
} | {
    data: null;
    error: ApiError;
};
export declare type ApiRefreshTokenResponse = {
    session: null;
    error: ApiError;
} | {
    session: Session;
    error: null;
};
export interface ApiSignOutResponse {
    error: ApiError | null;
}
export interface ApiResetPasswordResponse {
    error: ApiError | null;
}
export interface ApiChangePasswordResponse {
    error: ApiError | null;
}
export interface ApiSendVerificationEmailResponse {
    error: ApiError | null;
}
export interface ApiChangeEmailResponse {
    error: ApiError | null;
}
export interface ApiDeanonymizeResponse {
    error: ApiError | null;
}
//# sourceMappingURL=types.d.ts.map