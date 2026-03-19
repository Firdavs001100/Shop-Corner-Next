import type { AppProps } from 'next/app';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import React, { useState } from 'react';
import { light } from '../scss/MaterialTheme';
import { ApolloProvider } from '@apollo/client';
import { useApollo } from '../apollo/client';
import { appWithTranslation } from 'next-i18next';
import { Toaster } from 'react-hot-toast';
import Chat from '../libs/components/Chat';
import '../scss/app.scss';
import '../scss/pc/main.scss';
import '../scss/mobile/main.scss';

const App = ({ Component, pageProps }: AppProps) => {
	// @ts-ignore
	const [theme, setTheme] = useState(createTheme(light));
	const client = useApollo(pageProps.initialApolloState);

	return (
		<ApolloProvider client={client}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Toaster
					position="top-center"
					reverseOrder={false}
					toastOptions={{
						duration: 3000,
						style: { fontSize: '14px', borderRadius: '8px', padding: '12px' },
					}}
				/>
				<Component {...pageProps} />
				<Chat />
			</ThemeProvider>
		</ApolloProvider>
	);
};

export default appWithTranslation(App);
