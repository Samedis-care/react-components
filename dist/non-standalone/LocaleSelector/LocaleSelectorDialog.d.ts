import React from "react";
export type LocaleSelectorDialogClassKey = "root" | "title" | "contentWrapper" | "content";
export interface LocaleSelectorDialogCommonProps {
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
export interface LocaleSelectorDialogProps extends LocaleSelectorDialogCommonProps {
    className?: string;
    classes?: Partial<Record<LocaleSelectorDialogClassKey, string>>;
}
declare const _default: React.MemoExoticComponent<(inProps: LocaleSelectorDialogProps) => React.JSX.Element>;
export default _default;
