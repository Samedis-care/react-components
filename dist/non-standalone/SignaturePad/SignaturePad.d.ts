import React from "react";
import { SignPadProps } from "../../standalone/SignPad/index";
export interface SignaturePadCanvasProps extends SignPadProps {
    /**
     * The name of the input
     */
    name?: string;
    /**
     * The props used to draw HTML canvas
     */
    canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
    /**
     * Boolean flag to clear signature
     */
    clearOnResize?: boolean;
    /**
     * Use to change signature pen color
     */
    penColor?: string;
    /**
     * Callback method which returns signature base64 string
     */
    setSignature?: (imageURL: string) => void;
}
declare const _default: React.MemoExoticComponent<(props: SignaturePadCanvasProps & Omit<SignPadProps, "classes" | "openSignPad">) => JSX.Element>;
export default _default;
