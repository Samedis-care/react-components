import React from "react";
export interface CCI18nProviderProps {
    /**
     * The children to render
     */
    children: React.ReactNode;
    /**
     * Disable setting of HTML language attribute
     */
    disableHtmlLanguageAttributeSetter?: boolean;
}
declare const _default: React.MemoExoticComponent<(props: CCI18nProviderProps) => import("react/jsx-runtime").JSX.Element>;
export default _default;
