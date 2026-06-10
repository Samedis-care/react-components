import React from "react";
export interface FormPageLayoutProps {
    body: React.ReactNode;
    footer: React.ReactNode;
    other?: React.ReactNode;
    /**
     * class name to apply to root
     */
    className?: string;
    /**
     * custom CSS classes
     */
    classes?: Partial<Record<FormPageLayoutClassKey, string>>;
}
export type FormPageLayoutClassKey = "root" | "wrapper" | "body" | "footer";
declare const _default: React.MemoExoticComponent<(inProps: FormPageLayoutProps) => React.JSX.Element>;
export default _default;
