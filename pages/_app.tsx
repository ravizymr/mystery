import React from "react"
import "../styles/globals.scss"
import Layout from "../layout"
import type { AppProps } from "next/app"
import SSRProvider from "react-bootstrap/SSRProvider"
import StateWrapper from "context/state"

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SSRProvider>
      <StateWrapper value={null}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </StateWrapper>
    </SSRProvider>
  );
}

export default MyApp;
