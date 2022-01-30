import { jsx as _jsx } from 'react/jsx-runtime.js';
/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import fetch from 'isomorphic-unfetch';
import ws from 'isomorphic-ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { cacheExchange, createClient, dedupExchange, fetchExchange, Provider, subscriptionExchange, } from 'urql';
import { authExchange } from '@urql/exchange-auth';
export function generateUrqlClient(auth, gqlEndpoint, 
// headers, //do we still need them? see addAuthToOperation()
publicRole = "public") {
    const ssr = typeof window === "undefined";
    // eslint-disable-next-line @typescript-eslint/require-await
    const getAuth = async () => {
        if (!auth.isAuthenticated()) {
            const token = auth.getJWTToken();
            const refreshToken = !ssr && localStorage.getItem("refresh_token");
            if (token && refreshToken) {
                return { token, refreshToken };
            }
            return null;
        }
        // we could try a refresh token mutation/operation
        // if auth.refreshToken() would be a public function
        // const result = await auth.refreshToken(authState.refreshToken)
        // if (result) {
        //   return
        // }
        // else we logout
        // auth.logout()
        return null;
    };
    const addAuthToOperation = ({ operation, }) => {
        const fetchOptions = typeof operation.context.fetchOptions === "function"
            ? operation.context.fetchOptions()
            : operation.context.fetchOptions || {};
        return {
            ...operation,
            context: {
                ...operation.context,
                fetchOptions: {
                    ...fetchOptions,
                    headers: !auth.isAuthenticated()
                        ? {
                            ...fetchOptions.headers,
                            role: publicRole,
                        }
                        : {
                            ...fetchOptions.headers,
                            Authorization: `Bearer ${auth.getJWTToken()}`,
                        },
                },
            },
        };
    };
    const didAuthError = ({ error }) => error.graphQLErrors.some((e) => { var _a; return ((_a = e.extensions) === null || _a === void 0 ? void 0 : _a.code) === "FORBIDDEN"; });
    const uri = gqlEndpoint;
    const wsUri = uri.startsWith("https") ? uri.replace(/^https/, "wss") : uri.replace(/^http/, "ws");
    const subscriptionClient = new SubscriptionClient(wsUri, {
        reconnect: true,
        connectionParams: {
            headers: !auth.isAuthenticated()
                ? { role: publicRole }
                : { Authorization: `Bearer ${auth.getJWTToken()}` },
        },
    }, ws);
    // TODO really ulgy anys
    const authExchangeConfig = authExchange({
        getAuth,
        addAuthToOperation,
        didAuthError,
    });
    const client = createClient({
        url: uri,
        fetch,
        requestPolicy: "cache-and-network",
        exchanges: [
            dedupExchange,
            // debugExchange,
            cacheExchange,
            authExchangeConfig,
            fetchExchange,
            subscriptionExchange({
                forwardSubscription(operation) {
                    return subscriptionClient.request(operation);
                },
            }),
        ],
    });
    return client;
}
export const NhostUrqlProvider = (props) => {
    const { auth, gqlEndpoint, publicRole = "public", children } = props;
    const client = generateUrqlClient(auth, gqlEndpoint, publicRole);
    return _jsx(Provider, { value: client, children: children }, void 0);
};
//# sourceMappingURL=index.js.map
