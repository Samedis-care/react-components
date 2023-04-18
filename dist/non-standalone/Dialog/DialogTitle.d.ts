import React from "react";
export interface DialogTitleProps {
    id?: string;
    children: React.ReactNode;
    onClose?: () => void;
    /**
     * special CSS which puts buttons on the right floating
     */
    noTitle?: boolean;
}
export declare const DialogTitle: React.MemoExoticComponent<(props: DialogTitleProps) => JSX.Element>;
