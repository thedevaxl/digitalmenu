import '../app/globals.css'
import type { AppProps } from 'next/app'
import PlausibleProvider from 'next-plausible'

function MyApp({ Component, pageProps }: AppProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return (
    <PlausibleProvider domain={baseUrl}>
      <Component {...pageProps} />
    </PlausibleProvider>
  )
}

export default MyApp
