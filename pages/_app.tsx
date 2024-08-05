import "../app/globals.css";
import type { AppProps } from "next/app";
import PlausibleProvider from "next-plausible";

function MyApp({ Component, pageProps }: AppProps) {
  const plausibleDomain = "allrestaurants.menu";

  return (
    <PlausibleProvider domain={plausibleDomain}>
      <Component {...pageProps} />
    </PlausibleProvider>
  );
}

export default MyApp;
