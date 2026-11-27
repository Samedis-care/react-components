import { jsx as _jsx } from "react/jsx-runtime";
import React, { useEffect, useState } from "react";
import { getI18n, I18nextProvider } from "react-i18next";
import ccI18n from "../i18n";
import getCurrentLocale, { getCurrentLanguage, } from "../utils/getCurrentLocale";
import moment from "moment";
import applyMomentLocale from "./applyMomentLocale";
import MomentLocaleContext from "./MomentLocaleContext";
/**
 * Keeps moment's global locale and, unless disabled, `<html lang>` on
 * `ComponentsCareI18n`'s language, and re-renders its children once a
 * language change is applied. The `Framework` renders it.
 *
 * Moment's short date format (`L`), the one the date pickers take and show
 * dates in, is the one the date renderers display dates in (Intl's, with
 * `ToDateLocaleStringOptions`), so a date can be typed as it is shown: moment
 * has no locale for most regions and falls back to the language's (en-ZA and
 * en-NG to en's MM/DD/YYYY, where the renderers show 2026/12/31 and
 * 31/12/2026), and some of its own differ (es-US). Such a region gets a moment
 * locale of its own name (`en-za`), based on the language's, with the
 * renderers' order of day, month and year and the text between them; where
 * moment has the region, its `L` is changed. Moment's other formats (`LT`,
 * `LL`, …) stay moment's. The `Framework`'s date pickers follow the moment
 * locale once it is applied, also those already shown.
 */
const CCI18nProvider = (props) => {
    const { disableHtmlLanguageAttributeSetter } = props;
    const [updating, setUpdating] = useState(false);
    // the moment locale of the update applied last, null until the first one applies
    const [momentLocale, setMomentLocale] = useState(null);
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
                appliedLocale = applyMomentLocale(lang);
                setMomentLocale(appliedLocale);
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
    return (_jsx(MomentLocaleContext.Provider, { value: momentLocale, children: _jsx(I18nextProvider, { i18n: getI18n() ?? ccI18n, 
            // defaultNS used to force refresh
            defaultNS: updating
                ? ((getI18n() ?? ccI18n).options.defaultNS || "")
                : undefined, children: props.children }) }));
};
export default React.memo(CCI18nProvider);
