import React from "react";
export interface LocaleSelectorDialogProps {
    /**
     * List of supported locales and/or languages
     * Examples:
     * - en-US # allow en-US
     * - en    # allow all en based locales
     * - de-DE # allow de-DE
     * - de    # allow all de based languages
     */
    supportedLocales?: string[];
}
declare const _default: React.MemoExoticComponent<(props: LocaleSelectorDialogProps) => JSX.Element>;
export default _default;
