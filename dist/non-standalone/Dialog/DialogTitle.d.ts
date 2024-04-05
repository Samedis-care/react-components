import React from "react";
export interface DialogTitleProps {
    id?: string;
    children: React.ReactNode;
    onClose?: () => void;
    /**
     * special CSS which puts buttons on the right floating
     */
    noTitle?: boolean;
    /**
     * css class to apply to root
     */
    className?: string;
    /**
     * custom CSS styles
     */
    classes?: Partial<Record<DialogTitleClassKey, string>>;
}
export type DialogTitleClassKey = "root" | "textWrapper" | "text" | "closeButton";
export declare const DialogTitle: React.MemoExoticComponent<(inProps: DialogTitleProps) => React.JSX.Element>;
