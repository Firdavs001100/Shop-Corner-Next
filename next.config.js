/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	env: {
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
		NEXT_PUBLIC_API_GRAPHQL_URL: process.env.NEXT_PUBLIC_API_GRAPHQL_URL,
		NEXT_APP_API_WS: process.env.NEXT_APP_API_WS,
	},
};

const { i18n } = require('./next-i18next.config');
nextConfig.i18n = i18n;

module.exports = nextConfig;
