import { jsx as _jsx } from "react/jsx-runtime";
import React, { useEffect, useState } from "react";
import { getI18n, I18nextProvider } from "react-i18next";
import ccI18n from "../i18n";
import getCurrentLocale, { getCurrentLanguage, } from "../utils/getCurrentLocale";
import moment from "moment";
/**
 * Keeps moment's global locale and, unless disabled, `<html lang>` on
 * `ComponentsCareI18n`'s language, and re-renders its children once a
 * language change is applied. The `Framework` renders it.
 */
const CCI18nProvider = (props) => {
    const { disableHtmlLanguageAttributeSetter } = props;
    const [updating, setUpdating] = useState(false);
    const [, setMomentLocale] = useState(getCurrentLocale(ccI18n));
    // the language of the update applied last, null until the first one applies
    const [appliedLanguage, setAppliedLanguage] = useState(null);
    useEffect(() => {
        // The moment locales load in any order, so only the latest update
        // applies its locale and ends `updating`. Loading a locale also makes it
        // moment's global one (moment.defineLocale does that), so a stale update
        // puts back the locale applied last. After the cleanup, no update does
        // anything.
        let latestUpdate = 0;
        let appliedLocale = moment.locale();
        let active = true;
        const updateLocale = () => {
            const update = ++latestUpdate;
            void (async () => {
                setUpdating(true);
                const lang = getCurrentLocale(ccI18n) ?? "en-US"; // fallback
                const language = getCurrentLanguage(ccI18n);
                try {
                    await import("moment/locale/" + lang.toLowerCase());
                }
                catch {
                    try {
                        await import("moment/locale/" + language.toLowerCase());
                    }
                    catch {
                        // locale not found
                    }
                }
                if (!active)
                    return;
                if (update !== latestUpdate) {
                    moment.locale(appliedLocale);
                    return;
                }
                appliedLocale = moment.locale(lang);
                setMomentLocale(lang);
                setAppliedLanguage(language);
                setUpdating(false);
            })();
        };
        updateLocale();
        ccI18n.on("languageChanged", updateLocale);
        return () => {
            active = false;
            ccI18n.off("languageChanged", updateLocale);
        };
    }, []);
    useEffect(() => {
        if (disableHtmlLanguageAttributeSetter || appliedLanguage === null)
            return;
        document.documentElement.lang = appliedLanguage;
    }, [appliedLanguage, disableHtmlLanguageAttributeSetter]);
    return (_jsx(I18nextProvider, { i18n: getI18n() ?? ccI18n, 
        // defaultNS used to force refresh
        defaultNS: updating
            ? ((getI18n() ?? ccI18n).options.defaultNS || "")
            : undefined, children: props.children }));
};
export default React.memo(CCI18nProvider);
