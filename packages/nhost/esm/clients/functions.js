import axios from 'axios';
export class NhostFunctionsClient {
    constructor(params) {
        const { url } = params;
        this.accessToken = null;
        this.instance = axios.create({
            baseURL: url,
        });
    }
    async call(url, data, config) {
        const headers = {
            ...this.generateAccessTokenHeaders(),
            ...config === null || config === void 0 ? void 0 : config.headers,
        };
        let res;
        try {
            res = await this.instance.post(url, data, { ...config, headers });
        }
        catch (error) {
            if (error instanceof Error) {
                return { res: null, error };
            }
        }
        if (!res) {
            return {
                res: null,
                error: Error("Unable to make post request to funtion"),
            };
        }
        return { res, error: null };
    }
    setAccessToken(accessToken) {
        if (!accessToken) {
            this.accessToken = null;
            return;
        }
        this.accessToken = accessToken;
    }
    generateAccessTokenHeaders() {
        if (!this.accessToken) {
            return;
        }
        return {
            Authorization: `Bearer ${this.accessToken}`,
        };
    }
}
//# sourceMappingURL=functions.js.map
