import React from "react";
export interface CCI18nProviderProps {
    /**
     * The children to render
     */
    children: React.ReactNode;
    /**
     * Leaves the `lang` attribute of the `<html>` element to the app, for an
     * app that sets it itself (e.g. to the language of the content shown).
     * By default (`false`), `<html lang>` follows `ComponentsCareI18n`: once a
     * language change is applied, it is set to the language without region
     * (e.g. "de" for "de-DE"), overwriting any value the app set. Turning it
     * off after mount sets `<html lang>` to the current language right away;
     * turning it on keeps the value until the app changes it.
     */
    disableHtmlLanguageAttributeSetter?: boolean;
}
declare const _default: React.MemoExoticComponent<(props: CCI18nProviderProps) => React.JSX.Element>;
export default _default;
