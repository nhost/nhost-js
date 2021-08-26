import { ReactNode, useState } from 'react';
import {
  ApolloProvider,
  ApolloClient,
  createHttpLink,
  split,
  InMemoryCache,
  from,
  ApolloClientOptions,
  RequestHandler,
} from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { setContext } from '@apollo/client/link/context';
import { useNhost } from '../hooks';
import { NhostClient } from '../../core';
import { SubscriptionClient } from 'subscriptions-transport-ws';

const isBrowser = () => typeof window !== 'undefined';

function generateApolloClient({
  nhost,
  headers,
  publicRole = 'public',
  cache,
  connectToDevTools,
  onError,
}: {
  nhost: NhostClient;
  headers: any;
  publicRole: string;
  connectToDevTools: boolean;
  cache: InMemoryCache;
  onError?: RequestHandler;
}) {
  const getAuthHeaders = () => {
    // add headers
    const resHeaders = {
      ...headers,
    };

    // add auth headers if signed in
    // or add 'public' role if not signed in
    if (nhost.auth.isAuthenticated()) {
      resHeaders.authorization = `Bearer ${nhost.auth.getAccessToken()}`;
    } else {
      resHeaders.role = publicRole;
    }

    return resHeaders;
  };

  const uri = nhost.getGraphqlUrl();

  const wsUri = uri.startsWith('https')
    ? uri.replace(/^https/, 'wss')
    : uri.replace(/^http/, 'ws');

  let webSocketClient: SubscriptionClient | undefined;
  if (isBrowser()) {
    webSocketClient = new SubscriptionClient(wsUri, {
      lazy: true,
      reconnect: true,
      connectionParams: () => {
        const headers = getAuthHeaders();
        return {
          headers,
        };
      },
    });
  }

  // if webSocketClient is set, we're in the browser.
  const wsLink = webSocketClient ? new WebSocketLink(webSocketClient) : null;

  const httplink = createHttpLink({
    uri,
  });

  const authLink = setContext(() => {
    return {
      headers: {
        ...getAuthHeaders(),
      },
    };
  });

  const link = wsLink
    ? split(
        ({ query }) => {
          const mainDefinition = getMainDefinition(query);

          const kind = mainDefinition.kind;
          let operation;
          if ('operation' in mainDefinition) {
            operation = mainDefinition.operation;
          }

          return kind === 'OperationDefinition' && operation === 'subscription';
        },
        wsLink,
        authLink.concat(httplink)
      )
    : httplink;

  const apolloClientOptions: ApolloClientOptions<any> = {
    cache: cache || new InMemoryCache(),
    ssrMode: !isBrowser(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
    },
    connectToDevTools,
  };

  // add link
  if (typeof onError === 'function') {
    apolloClientOptions.link = from([onError, link]);
  } else {
    apolloClientOptions.link = from([link]);
  }

  const client = new ApolloClient(apolloClientOptions);

  return { client, webSocketClient };
}

export function NhostApolloProvider({
  children,
  headers = {},
  publicRole = 'public',
  cache = new InMemoryCache(),
  connectToDevTools = false,
  onError,
}: {
  children: ReactNode;
  headers?: any;
  publicRole?: string;
  connectToDevTools?: boolean;
  cache?: InMemoryCache;
  onError?: RequestHandler;
}) {
  const { nhost } = useNhost();

  const [constructorHasRun, setConstructorHasRun] = useState(false);
  const [apolloClient, setApolloClient] = useState<ApolloClient<any> | null>(
    null
  );

  const constructor = () => {
    if (constructorHasRun) return;

    const { client, webSocketClient } = generateApolloClient({
      nhost,
      headers,
      publicRole,
      cache,
      connectToDevTools,
      onError,
    });

    if (nhost.auth && webSocketClient) {
      nhost.auth.onTokenChanged(() => {
        if (webSocketClient.status === 1) {
          //@ts-ignore
          webSocketClient.tryReconnect();
        }
      });

      // restart websocket link when
      nhost.auth.onAuthStateChanged(async (event, _session) => {
        // reconnect ws connection with new auth headers for the logged in/out user
        if (webSocketClient.status === 1) {
          // must close first to avoid race conditions
          webSocketClient.close();
          // reconnect
          //@ts-ignore
          webSocketClient.tryReconnect();
        }
        if (event === 'SIGNED_OUT') {
          await client.resetStore().catch((error) => {
            console.error('Error resetting Apollo client cache');
            console.error(error);
          });
        }
      });
    }

    setApolloClient(client);

    setConstructorHasRun(true);
  };

  constructor();

  // maybe skip if !inBrowser()?
  if (!apolloClient) {
    return <div>Apollo Client not yet available</div>;
  }

  // if (!isBrowser()) {
  //   return <div>no</div>;
  // }

  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}
