import { useTranslations } from "../../utils/l10n";
import Link from "next/link";
import { useRouter } from "next/router"
import React from "react";
import { HollowButton } from "../components/Button/Hollow";
import { CTA } from "../components/CTA";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import Layout from "../components/Layout";
import { Subheader } from "../components/Subheader";
import { flags } from "../icons/Flags";
import { languages } from "../l10n/languages";

const LanguageSwitcher = () => {
    const { locale } = useRouter();

    const t = useTranslations("");

    const groups = [
        "Europe",
        "Americas",
        "Asia"
    ]

    return (
        <Layout title={String(t("subheader-language-switcher-title"))}>
            <div className={"w-full flex flex-col h-full md:min-h-screen items-center"}>
                <Header />

                <div className={"w-full flex justify-center bg-white map-pattern text-black py-32 pb-44 text-center"}>
                    <div className={"max-w-7xl"}>
                        <h1 className={"text-6xl font-bold"} style={{ lineHeight: "5rem" }}>{t("subheader-language-switcher-title")}</h1>
                    </div>
                </div>

                <div id={"main-content"} className={"container my-10 max-w-7xl w-full flex flex-col gap-8 flex-wrap md:px-8 sm:px-8 lg:px-0 px-0"}>
                    {groups.map(group => (
                        <div className={"gap-8 flex flex-col"} key={group}>
                            <h1 className={"text-2xl font-semibold"}>{t(`region-${group.toLowerCase()}`)}</h1>

                            <div className={"flex gap-6 flex-wrap"}>
                                {languages.filter(x => x.group == group).map(language => {
                                    const Icon = (flags as any)[language.code];
            
                                    return (
                                        <Link key={language.code} href={"/"} locale={language.code}>
                                            <a title={language.name} className={"flex flex-col font-medium text-lg cursor-pointer max-w-14 w-max transform hover:scale-105 transition-transform items-center justify-center"} key={language.code}>
                                                <Icon className={"rounded-full"} style={{ 
                                                    width: "64px", 
                                                    height: "64px", 
                                                    marginBlockEnd: "1rem" 
                                                }} />
                                                <span className={"w-full text-xs overflow-hidden overflow-ellipsis text-center"} style={{ maxWidth: "72px" }}>
                                                    {language.name}
                                                </span>
                                            </a>
                                        </Link>
                                    )
                                })}
                            </div>

                            <hr className={"border-gray6"} />
                        </div>
                    ))}
                </div>

                <CTA />
                <Footer />
            </div>
        </Layout>
    )
}

export function getStaticProps({ locale }: { locale: string }) {
    if(locale == "en") locale = "en-GB";

    return {
        props: {
            messages: require(`../l10n/${locale}.json`),
        }
    };
}

export default LanguageSwitcher;