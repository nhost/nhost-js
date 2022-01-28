import { ApiChangeEmailResponse, ApiChangePasswordResponse, ApiDeanonymizeResponse, ApiRefreshTokenResponse, ApiResetPasswordResponse, ApiSendVerificationEmailResponse, ApiSignInResponse, ApiSignOutResponse, ChangeEmailParams, ChangePasswordParams, DeanonymizeParams, ResetPasswordParams, SendVerificationEmailParams, SignInEmailPasswordParams, SignInPasswordlessEmailParams, SignInPasswordlessSmsOtpParams, SignInPasswordlessSmsParams, SignUpEmailPasswordParams } from './utils/types';
export declare class HasuraAuthApi {
    private url;
    private httpClient;
    private accessToken;
    constructor({ url }: {
        url?: string | undefined;
    });
    /**
     * Use `signUpWithEmailAndPassword` to sign up a new user using email and password.
     */
    signUpEmailPassword(params: SignUpEmailPasswordParams): Promise<ApiSignInResponse>;
    signInEmailPassword(params: SignInEmailPasswordParams): Promise<ApiSignInResponse>;
    signInPasswordlessEmail(params: SignInPasswordlessEmailParams): Promise<ApiSignInResponse>;
    signInPasswordlessSms(params: SignInPasswordlessSmsParams): Promise<ApiSignInResponse>;
    signInPasswordlessSmsOtp(params: SignInPasswordlessSmsOtpParams): Promise<ApiSignInResponse>;
    signOut(params: {
        refreshToken: string;
        all?: boolean;
    }): Promise<ApiSignOutResponse>;
    refreshToken(params: {
        refreshToken: string;
    }): Promise<ApiRefreshTokenResponse>;
    resetPassword(params: ResetPasswordParams): Promise<ApiResetPasswordResponse>;
    changePassword(params: ChangePasswordParams): Promise<ApiChangePasswordResponse>;
    sendVerificationEmail(params: SendVerificationEmailParams): Promise<ApiSendVerificationEmailResponse>;
    changeEmail(params: ChangeEmailParams): Promise<ApiChangeEmailResponse>;
    deanonymize(params: DeanonymizeParams): Promise<ApiDeanonymizeResponse>;
    verifyEmail(params: {
        email: string;
        ticket: string;
    }): Promise<ApiSignInResponse>;
    setAccessToken(accessToken: string | undefined): void;
    private generateAuthHeaders;
}
//# sourceMappingURL=hasura-auth-api.d.ts.map