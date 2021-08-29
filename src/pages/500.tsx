import React from "react";
import { Error } from "../components/Error";

const InternalServerError = () => {
    return (
        <Error 
            code={500} 
            buttonClick={() => window.location.reload()} 
            buttonHref={""} 
        />
    )
}

export function getStaticProps({ locale }: { locale: string }) {
    return {
        props: {
            messages: require(`../l10n/${locale}.json`),
        }
    };
}

export default InternalServerError;