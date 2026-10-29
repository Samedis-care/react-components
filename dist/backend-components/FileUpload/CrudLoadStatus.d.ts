import React from "react";
export interface CrudLoadStatusProps {
    /**
     * The field's label, as the loaded field shows it
     */
    label: React.ReactNode;
    /**
     * @see GroupBoxProps.smallLabel
     */
    smallLabel?: boolean;
    /**
     * CSS class of the frame, as the loaded field gets it
     */
    className?: string;
    /**
     * What the field lists, which names what could not be loaded
     */
    kind: "files" | "images";
    /**
     * Why the load failed, if it did: shown in place of the spinner
     */
    error?: Error | null;
    /**
     * Custom CSS classes
     */
    classes?: Partial<Record<CrudLoadStatusClassKey, string>>;
}
export type CrudLoadStatusClassKey = "message" | "detail";
declare const _default: React.MemoExoticComponent<(inProps: CrudLoadStatusProps) => React.JSX.Element>;
export default _default;
