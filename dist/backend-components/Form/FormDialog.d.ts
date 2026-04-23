import React, { Dispatch, SetStateAction } from "react";
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
export type FormDialogTitlePriorityMode = "prop" | "dispatch";
export interface FormDialogDispatch {
    setTitle: (title: React.ReactNode) => void;
    setOpenInNewLink: Dispatch<SetStateAction<null | (() => void)>>;
    blockClosing: () => void;
    unblockClosing: () => void;
    /**
     * Set the priority mode for the dialog title.
     * - "prop" (default): dialogTitle prop takes priority over title set via setTitle
     * - "dispatch": title set via setTitle takes priority over dialogTitle prop
     */
    setTitlePriorityMode: Dispatch<SetStateAction<FormDialogTitlePriorityMode>>;
}
export declare const IsInFormDialogContext: React.Context<boolean>;
export declare const FormDialogDispatchContext: React.Context<FormDialogDispatch | undefined>;
export declare const FormDialogDefaultRenderer: (props: FormDialogRendererProps) => import("react/jsx-runtime").JSX.Element;
declare const _default: React.MemoExoticComponent<(inProps: FormDialogProps) => import("react/jsx-runtime").JSX.Element>;
export default _default;
