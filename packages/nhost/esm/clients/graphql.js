import axios from 'axios';
export class NhostGraphqlClient {
    constructor(params) {
        const { url } = params;
        this.url = url;
        this.accessToken = null;
        this.instance = axios.create({
            baseURL: url,
        });
    }
    async request(document, variables, config) {
        // add auth headers if any
        const headers = {
            ...config === null || config === void 0 ? void 0 : config.headers,
            ...this.generateAccessTokenHeaders(),
        };
        const operationName = "";
        let responseData;
        try {
            const res = await this.instance.post("", {
                operationName: operationName ? operationName : undefined,
                query: document,
                variables,
            }, { ...config, headers });
            responseData = res.data;
        }
        catch (error) {
            if (error instanceof Error) {
                return { data: null, error };
            }
            console.error(error);
            return { data: null, error: Error("Unable to get do GraphQL request") };
        }
        if (typeof responseData !== "object" ||
            Array.isArray(responseData) ||
            responseData === null) {
            return {
                data: null,
                error: Error("incorrect response data from GraphQL server"),
            };
        }
        responseData = responseData;
        if (responseData.errors) {
            return {
                data: null,
                error: responseData.errors,
            };
        }
        return { data: responseData.data, error: null };
    }
    getUrl() {
        return this.url;
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
//# sourceMappingURL=graphql.js.map
