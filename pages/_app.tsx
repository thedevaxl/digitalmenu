import "../app/globals.css";
import type { AppProps } from "next/app";
import PlausibleProvider from "next-plausible";

const plausibleDomain = "allrestaurants.menu";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <PlausibleProvider domain={plausibleDomain} />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
