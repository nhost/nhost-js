import axios from 'axios';
const SERVER_ERROR_CODE = 500;
export class HasuraAuthApi {
    constructor({ url = "" }) {
        this.url = url;
        this.httpClient = axios.create({
            baseURL: this.url,
            timeout: 10000,
        });
        // convert axios error to custom ApiError
        this.httpClient.interceptors.response.use((response) => response, 
        // eslint-disable-next-line promise/prefer-await-to-callbacks
        (error) => {
            var _a, _b, _c, _d, _e, _f;
            // eslint-disable-next-line prefer-promise-reject-errors, promise/no-promise-in-callback
            return Promise.reject({
                message: (_d = (_c = (_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) !== null && _c !== void 0 ? _c : error.message) !== null && _d !== void 0 ? _d : JSON.stringify(error),
                status: (_f = (_e = error.response) === null || _e === void 0 ? void 0 : _e.status) !== null && _f !== void 0 ? _f : SERVER_ERROR_CODE,
            });
        });
    }
    /**
     * Use `signUpWithEmailAndPassword` to sign up a new user using email and password.
     */
    async signUpEmailPassword(params) {
        try {
            const res = await this.httpClient.post("/signup/email-password", params);
            return { data: res.data, error: null };
        }
        catch (error) {
            return { data: null, error: error };
        }
    }
    async signInEmailPassword(params) {
        try {
            const res = await this.httpClient.post("/signin/email-password", params);
            return { data: res.data, error: null };
        }
        catch (error) {
            return { data: null, error: error };
        }
    }
    async signInPasswordlessEmail(params) {
        try {
            const res = await this.httpClient.post("/signin/passwordless/email", params);
            return { data: res.data, error: null };
        }
        catch (error) {
            return { data: null, error: error };
        }
    }
    async signInPasswordlessSms(params) {
        try {
            const res = await this.httpClient.post("/signin/passwordless/sms", params);
            return { data: res.data, error: null };
        }
        catch (error) {
            return { data: null, error: error };
        }
    }
    async signInPasswordlessSmsOtp(params) {
        try {
            const res = await this.httpClient.post("/signin/passwordless/sms/otp", params);
            return { data: res.data, error: null };
        }
        catch (error) {
            return { data: null, error: error };
        }
    }
    async signOut(params) {
        try {
            await this.httpClient.post("/signout", params);
            return { error: null };
        }
        catch (error) {
            return { error: error };
        }
    }
    async refreshToken(params) {
        try {
            const res = await this.httpClient.post("/token", params);
            return { error: null, session: res.data };
        }
        catch (error) {
            return { error: error, session: null };
        }
    }
    async resetPassword(params) {
        try {
            await this.httpClient.post("/user/password/reset", params);
            return { error: null };
        }
        catch (error) {
            return { error: error };
        }
    }
    async changePassword(params) {
        try {
            await this.httpClient.post("/user/password", params, {
                headers: {
                    ...this.generateAuthHeaders(),
                },
            });
            return { error: null };
        }
        catch (error) {
            return { error: error };
        }
    }
    async sendVerificationEmail(params) {
        try {
            await this.httpClient.post("/user/email/send-verification-email", params);
            return { error: null };
        }
        catch (error) {
            return { error: error };
        }
    }
    async changeEmail(params) {
        try {
            await this.httpClient.post("/user/email/change", params, {
                headers: {
                    ...this.generateAuthHeaders(),
                },
            });
            return { error: null };
        }
        catch (error) {
            return { error: error };
        }
    }
    async deanonymize(params) {
        try {
            await this.httpClient.post("/user/deanonymize", params);
            return { error: null };
        }
        catch (error) {
            return { error: error };
        }
    }
    // deanonymize
    async verifyEmail(params) {
        try {
            const res = await this.httpClient.post("/user/email/verify", params);
            return { data: res.data, error: null };
        }
        catch (error) {
            return { data: null, error: error };
        }
    }
    setAccessToken(accessToken) {
        this.accessToken = accessToken;
    }
    generateAuthHeaders() {
        if (!this.accessToken) {
            return null;
        }
        return {
            Authorization: `Bearer ${this.accessToken}`,
        };
    }
}
//# sourceMappingURL=hasura-auth-api.js.map
