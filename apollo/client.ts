import { useMemo } from 'react';
import { ApolloClient, ApolloLink, InMemoryCache, split, from, NormalizedCacheObject } from '@apollo/client';
import createUploadLink from 'apollo-upload-client/public/createUploadLink.js';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import { getJwtToken } from '../libs/auth';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import { socketVar } from './store';
import decodeJWT from 'jwt-decode';

let apolloClient: ApolloClient<NormalizedCacheObject>;

class RobustWebSocket {
	private realSocket: WebSocket | null = null;
	private url: string;
	private reconnectAttempts = 0;
	private maxReconnects = 5;
	private reconnectTimer: NodeJS.Timeout | null = null;

	onopen: ((ev: Event) => void) | null = null;
	onclose: ((ev: CloseEvent) => void) | null = null;
	onerror: ((ev: Event) => void) | null = null;
	onmessage: ((ev: MessageEvent) => void) | null = null;

	constructor(url: string) {
		this.url = url;
		this.connect();
	}

	private connect() {
		this.realSocket = new WebSocket(this.url);
		socketVar(this.realSocket);

		this.realSocket.onopen = (ev) => {
			console.log('✅ WebSocket connection opened!');
			this.reconnectAttempts = 0;
			this.onopen?.(ev);
		};

		this.realSocket.onclose = (ev) => {
			console.log(`❌ WebSocket closed (code: ${ev.code})`);
			socketVar(null);
			this.onclose?.(ev);
			this.attemptReconnect();
		};

		this.realSocket.onerror = (ev) => {
			console.error('WebSocket error:', ev);
			this.onerror?.(ev);
		};

		this.realSocket.onmessage = (ev) => {
			this.onmessage?.(ev);
		};
	}

	private attemptReconnect() {
		if (this.reconnectAttempts >= this.maxReconnects) return;

		this.reconnectAttempts++;
		const delay = Math.min(1000 * this.reconnectAttempts, 10000);
		console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

		this.reconnectTimer = setTimeout(() => this.connect(), delay);
	}

	send(data: Parameters<WebSocket['send']>[0]) {
		if (this.realSocket?.readyState === WebSocket.OPEN) {
			this.realSocket.send(data);
		} else {
			console.warn('Socket not ready');
		}
	}

	close() {
		if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
		this.realSocket?.close();
	}

	get readyState() {
		return this.realSocket ? this.realSocket.readyState : WebSocket.CLOSED;
	}
}

function getHeaders() {
	const headers = {} as HeadersInit;
	const token = getJwtToken();
	// @ts-ignore
	if (token) headers['Authorization'] = `Bearer ${token}`;
	return headers;
}

const tokenRefreshLink = new TokenRefreshLink({
	accessTokenField: 'refreshToken',

	isTokenValidOrUndefined: () => {
		const token = getJwtToken();
		if (!token) return true;
		try {
			const { exp }: any = decodeJWT(token);
			return Date.now() < exp * 1000 - 5000;
		} catch {
			return false;
		}
	},

	fetchAccessToken: () => {
		const refreshToken = localStorage.getItem('refreshToken');
		return fetch(process.env.NEXT_PUBLIC_API_GRAPHQL_URL as string, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-refresh-token': refreshToken || '',
			},
			body: JSON.stringify({ query: `mutation { refreshToken }` }),
		});
	},

	handleFetch: (newAccessToken: string) => {
		localStorage.setItem('accessToken', newAccessToken);
	},

	handleError: () => {
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
	},
});

function createIsomorphicLink() {
	const uploadLink = createUploadLink({ uri: process.env.NEXT_PUBLIC_API_GRAPHQL_URL });

	const errorLink = onError(({ graphQLErrors, networkError }) => {
		if (graphQLErrors)
			graphQLErrors.forEach(({ message, locations, path }) =>
				console.log(`[GraphQL error]: ${message}`, locations, path),
			);
		if (networkError) console.log(`[Network error]: ${networkError}`);
	});

	const authLink = new ApolloLink((operation, forward) => {
		operation.setContext(({ headers = {} }) => ({ headers: { ...headers, ...getHeaders() } }));
		return forward(operation);
	});

	if (typeof window === 'undefined') {
		return from([errorLink, tokenRefreshLink, authLink.concat(uploadLink)]);
	}

	const wsLink = new WebSocketLink({
		uri: process.env.NEXT_APP_API_WS ?? 'ws://127.0.0.1:3007',
		options: {
			reconnect: true,
			timeout: 30000,
			connectionParams: () => ({ headers: getHeaders() }),
		},
		webSocketImpl: RobustWebSocket as any,
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
