import React from "react";
export type FormButtonsClassKey = "root" | "buttonWrapper";
export interface FormButtonsProps {
    /**
     * Action buttons (used on form)
     */
    children: React.ReactNode | React.ReactNode[];
    /**
     * custom CSS class to apply to root
     */
    className?: string;
    /**
     * custom CSS classes to apply
     */
    classes?: Partial<Record<FormButtonsClassKey, string>>;
}
declare const _default: React.MemoExoticComponent<(inProps: FormButtonsProps) => React.JSX.Element>;
export default _default;
