import React from "react";
export type FormButtonsClassKey = "root" | "buttonWrapper";
export interface FormButtonsProps {
    /**
     * Action buttons (used on form)
     */
    children: React.ReactNode | React.ReactNode[];
}
declare const _default: React.MemoExoticComponent<(inProps: FormButtonsProps) => React.JSX.Element>;
export default _default;
