import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en-US">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Island Troll Tribes - Official website for the Island Troll Tribes game community" />
        <meta name="robots" content="max-image-preview:large" />
        <meta name="vercel-live-disabled" content="true" />
        <link rel="icon" href="/icons/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

