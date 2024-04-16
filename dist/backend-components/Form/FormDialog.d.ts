import React from "react";
export interface FormDialogProps {
    /**
     * Dialog tille
     */
    dialogTitle?: React.ReactNode;
    /**
     * Dialog width optional parameter
     */
    maxWidth?: false | "lg" | "xs" | "sm" | "md" | "xl" | undefined;
    /**
     * Boolean flag to use custom classes
     */
    useCustomClasses?: boolean;
    /**
     * Add link button option
     */
    openInNewLink?: () => void;
    /**
     * Dialog contents
     */
    children?: React.ReactNode;
    /**
     * Called on dialog close
     */
    onClose?: () => void;
    /**
     * Disable automatic special handling of form dialog. Use if form dialog is only used as layout/design component
     */
    disableFormDialogContext?: boolean;
}
export type FormDialogClassKey = "content" | "openInNewIcon";
export interface FormDialogDispatch {
    setTitle: (title: React.ReactNode) => void;
    blockClosing: () => void;
    unblockClosing: () => void;
}
export declare const IsInFormDialogContext: React.Context<boolean>;
export declare const FormDialogDispatchContext: React.Context<FormDialogDispatch | undefined>;
declare const _default: React.MemoExoticComponent<(inProps: FormDialogProps) => React.JSX.Element>;
export default _default;
