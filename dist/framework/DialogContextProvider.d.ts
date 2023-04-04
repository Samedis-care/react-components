import React from "react";
import { IFrameworkProps } from "./Framework";
export declare type DialogType = React.ReactNode;
export declare type DialogContextType = [
    pushDialog: (dialog: React.ReactNode) => void,
    popDialog: () => void
];
/**
 * Context for the dialog state
 */
export declare const DialogContext: React.Context<DialogContextType | undefined>;
export declare const useDialogContext: () => DialogContextType;
declare const _default: React.MemoExoticComponent<(props: IFrameworkProps) => JSX.Element>;
export default _default;
