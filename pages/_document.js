// pages/_document.js
import React from 'react'; // Add this import
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html>
            <Head>
                {/* Link your favicon */}
                <link rel="icon" href="/radar.ico" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
