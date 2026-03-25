import React, { useEffect, useState } from "react";
import { getI18n, I18nextProvider } from "react-i18next";
import ccI18n from "../i18n";
import getCurrentLocale, { getCurrentLanguage, } from "../utils/getCurrentLocale";
import moment from "moment";
const CCI18nProvider = (props) => {
    const [updating, setUpdating] = useState(false);
    const [, setMomentLocale] = useState(getCurrentLocale(ccI18n));
    useEffect(() => {
        const updateLocale = () => {
            void (async () => {
                setUpdating(true);
                const lang = getCurrentLocale(ccI18n) ?? "en-US"; // fallback
                try {
                    await import("moment/locale/" + lang.toLowerCase());
                }
                catch {
                    try {
                        await import("moment/locale/" + getCurrentLanguage(ccI18n).toLowerCase());
                    }
                    catch {
                        // locale not found
                    }
                }
                finally {
                    moment.locale(lang);
                    setMomentLocale(lang);
                    const htmlTag = document.querySelector("html");
                    if (htmlTag)
                        htmlTag.lang = getCurrentLanguage(ccI18n);
                    setUpdating(false);
                }
            })();
        };
        updateLocale();
        ccI18n.on("languageChanged", updateLocale);
        return () => ccI18n.off("languageChanged", updateLocale);
    }, []);
    return (React.createElement(I18nextProvider, { i18n: getI18n() ?? ccI18n, 
        // defaultNS used to force refresh
        defaultNS: updating
            ? ((getI18n() ?? ccI18n).options.defaultNS || "")
            : undefined }, props.children));
};
export default React.memo(CCI18nProvider);
