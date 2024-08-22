import React from "react";
export type FormDialogRendererProps = Omit<FormDialogProps, "renderer">;
export interface FormDialogProps {
    /**
     * Dialog tille
     */
    dialogTitle?: React.ReactNode;
    /**
     * Dialog width optional parameter
     * @default "lg"
     */
    maxWidth?: false | "lg" | "xs" | "sm" | "md" | "xl" | undefined;
    /**
     * Dialog fullWidth param
     * @default true
     */
    fullWidth?: boolean;
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
    /**
     * CSS class name
     */
    className?: string;
    /**
     * Custom renderer, does not need to provide IsInFormDialogContext, FormDialogDispatchContext or handle their logic
     */
    renderer?: React.ComponentType<FormDialogRendererProps>;
}
export type FormDialogClassKey = "content" | "openInNewIcon";
export interface FormDialogDispatch {
    setTitle: (title: React.ReactNode) => void;
    blockClosing: () => void;
    unblockClosing: () => void;
}
export declare const IsInFormDialogContext: React.Context<boolean>;
export declare const FormDialogDispatchContext: React.Context<FormDialogDispatch | undefined>;
export declare const FormDialogDefaultRenderer: (props: FormDialogRendererProps) => React.JSX.Element;
declare const _default: React.MemoExoticComponent<(inProps: FormDialogProps) => React.JSX.Element>;
export default _default;
