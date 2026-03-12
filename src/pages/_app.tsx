import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Mindfuck - The Memory Card Game</title>
        <meta name="description" content="A real-time multiplayer memory card game. Play with friends!" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#030712" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
