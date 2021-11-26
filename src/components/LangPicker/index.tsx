import { useTranslations } from "../../../utils/l10n";
import React from "react";
import { useRipple } from "react-use-ripple";
import { ThemeColours } from "../../../theme";
import { ChevronDown } from "../../icons/ChevronDown";
import { flags } from "../../icons/Flags";
import { languages } from "../../l10n/languages";
import { Themes } from "../../utils/theme";
import { Menu } from "../Menu";

export const LangPicker = ({ locale, className, style, theme, menuTop, openerLocation, small }: { locale: any, className?: string, style?: any, theme?: number, menuTop?: string, openerLocation: string, small?: boolean }) => {
    const [l10nMenuVisible, setL10nMenuVisible] = React.useState<boolean>(false);

    const t = useTranslations();

    const ref = React.createRef<HTMLAnchorElement>();
    useRipple(ref, { animationLength: 350, rippleColor: theme == Themes.Dark ? ThemeColours.Gray4.toHex(0.3) : ThemeColours.Black.toHex(0.15) });

    if(locale == "en") locale = "en-GB"

    return (
        <div className={`relative flex ${className || ""}`} style={style}>
            <a title={languages.find(l => l.code == locale)?.name} ref={ref} onClick={e => {
                e.stopPropagation();
                e.preventDefault();

                if(l10nMenuVisible) return setL10nMenuVisible(false);
                else setL10nMenuVisible(true);
            }} href={"/language-switcher"} className={`flex items-center h-min p-2 ${theme == Themes.Dark ? `hover:bg-gray3` : `hover:bg-gray7`} rounded-xl cursor-pointer ${l10nMenuVisible ? `pointer-events-none ${theme == Themes.Dark ? `bg-gray3` : `bg-gray6`}` : ``}`}>
                {Object.entries(flags).map(([key, Value]) => {
                    if(key == locale) return <Value className={small ? `w-4 h-4` : ``} key={key} />
                })}

                {small && <span className={"font-semibold text-xs opacity-80 ml-2 mr-1"}>{languages.find(l => l.code == locale)?.name.split("(")[0]}</span>}

                <ChevronDown className={"transition-transform"} style={{ 
                    marginInlineStart: "0.5rem", 
                    marginInlineEnd: "0.25rem",
                    transform: l10nMenuVisible ? "rotate(180deg)" : "",
                    color: "currentColor"
                }} />
            </a>

            <Menu 
                visible={l10nMenuVisible} 
                setVisible={setL10nMenuVisible}
                menuTop={menuTop}
                openerLocation={openerLocation}
                items={[
                    ...languages.map(l => ({
                        text: l.name,
                        icon: (flags as any)[l.code],
                        active: locale == l.code,
                        locale: l.code
                    })),
                    {
                        text: "",
                        icon: () => <div style={{ width: "100%", textAlign: "center" }}>
                            {t("see-all-languages")}
                        </div>,
                        href: "/language-switcher"
                    }
                ]} />
        </div>
    )
}