import { useMemo } from 'react';
import { ApolloClient, ApolloLink, InMemoryCache, split, from, NormalizedCacheObject } from '@apollo/client';
import createUploadLink from 'apollo-upload-client/public/createUploadLink.js';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import { getJwtToken } from '../libs/auth';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import { toastError } from '../libs/toast';
import { socketVar } from './store';
let apolloClient: ApolloClient<NormalizedCacheObject>;

function getHeaders() {
	const headers = {} as HeadersInit;
	const token = getJwtToken();
	// @ts-ignore
	if (token) headers['Authorization'] = `Bearer ${token}`;
	return headers;
}

const tokenRefreshLink = new TokenRefreshLink({
	accessTokenField: 'accessToken',
	isTokenValidOrUndefined: () => {
		return true;
	}, // @ts-ignore
	fetchAccessToken: () => {
		// execute refresh token
		return null;
	},
});

// Custom WebSocket Client Config
class LoggingWebSocket {
	private socket: WebSocket;

	constructor(url: string) {
		this.socket = new WebSocket(`${url}?token=${getJwtToken()}`);
		socketVar(this.socket);

		this.socket.onopen = () => {
			console.log('WebSocket connection!');
		};
		this.socket.onmessage = (msg) => {
			console.log('WebSocket message:', msg.data);
		};
		this.socket.onerror = (err) => {
			console.log('WebSocket error:', err);
		};
	}

	send(data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView) {
		this.socket.send(data);
	}

	close() {
		this.socket.close();
	}
}

function createIsomorphicLink() {
	const uploadLink = createUploadLink({
		uri: process.env.NEXT_PUBLIC_API_GRAPHQL_URL,
	});

	const errorLink = onError(({ graphQLErrors, networkError }) => {
		if (graphQLErrors) {
			graphQLErrors.forEach(({ message, locations, path }) => {
				console.log(`[GraphQL error]: ${message}`, locations, path);
			});
		}
		if (networkError) console.log(`[Network error]: ${networkError}`);
	});

	const authLink = new ApolloLink((operation, forward) => {
		operation.setContext(({ headers = {} }) => ({
			headers: {
				...headers,
				...getHeaders(),
			},
		}));
		return forward(operation);
	});

	// 👉 SSR: NO WebSocket
	if (typeof window === 'undefined') {
		return from([errorLink, tokenRefreshLink, authLink.concat(uploadLink)]);
	}

	// 👉 CLIENT: WITH WebSocket
	const wsLink = new WebSocketLink({
		uri: process.env.NEXT_APP_API_WS ?? 'ws://127.0.0.1:3007',
		options: {
			reconnect: false,
			timeout: 30000,
			connectionParams: () => ({
				headers: getHeaders(),
			}),
		},
		webSocketImpl: LoggingWebSocket,
	});

	const splitLink = split(
		({ query }) => {
			const definition = getMainDefinition(query);
			return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
		},
		wsLink,
		authLink.concat(uploadLink),
	);

	return from([errorLink, tokenRefreshLink, splitLink]);
}
function createApolloClient() {
	return new ApolloClient({
		ssrMode: typeof window === 'undefined',
		link: createIsomorphicLink(),
		cache: new InMemoryCache(),
		resolvers: {},
	});
}

export function initializeApollo(initialState = null) {
	const _apolloClient = apolloClient ?? createApolloClient();
	if (initialState) _apolloClient.cache.restore(initialState);
	if (typeof window === 'undefined') return _apolloClient;
	if (!apolloClient) apolloClient = _apolloClient;

	return _apolloClient;
}

export function useApollo(initialState: any) {
	return useMemo(() => initializeApollo(initialState), [initialState]);
}
