import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import Head from "next/head";
import "../../styles/globals.css";
import BaseLayout from "../components/base-layout";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <title>BTC Guessr</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <BaseLayout>
        <Component {...pageProps} />
      </BaseLayout>
    </QueryClientProvider>
  );
}

export default MyApp;
