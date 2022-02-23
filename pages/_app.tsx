import React from "react"
import "../styles/globals.scss"
import Layout from "../layout"
import type { AppProps } from "next/app"
import SSRProvider from "react-bootstrap/SSRProvider"

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SSRProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SSRProvider>
  );
}

export default MyApp;
