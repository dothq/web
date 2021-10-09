import React from "react";

import type { AppProps } from "next/app"
import { NextIntlProvider } from "next-intl";

import { LoadEvent } from "../events/load";

import "../../styles/global.css";
import "../../styles/app.css";
import "../../styles/blog.css";

const Application = ({ Component, pageProps }: AppProps) => {
    React.useEffect(() => {
        window.addEventListener("load", () => new LoadEvent());
    }, [])

    return (
        <NextIntlProvider messages={pageProps.messages}>
            <Component {...pageProps} />
        </NextIntlProvider>
    )
}

export default Application;
