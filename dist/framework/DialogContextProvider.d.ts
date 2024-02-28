import React from "react";
import { IFrameworkProps } from "./Framework";
export type DialogType = React.ReactNode;
export type DialogContextType = [
    pushDialog: (dialog: React.ReactNode) => void,
    popDialog: () => void
];
/**
 * Context for the dialog state
 */
export declare const DialogContext: React.Context<DialogContextType | undefined>;
export declare const useDialogContext: () => DialogContextType;
declare const _default: React.MemoExoticComponent<(props: IFrameworkProps) => React.JSX.Element>;
export default _default;
