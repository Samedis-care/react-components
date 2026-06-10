import React from "react";
export interface ImageDotsProps {
    /**
     * Total number of images
     */
    total: number;
    /**
     * Currently active image
     */
    active: number;
    /**
     * Set currently active image
     * @param active Image index
     */
    setActive: (active: number) => void;
    /**
     * CSS class for root
     */
    className?: string;
    /**
     * Optional style overrides
     */
    classes?: Partial<Record<ImageDotsClassKey, string>>;
}
export type ImageDotsClassKey = "root" | "container" | "imageDot";
declare const _default: React.MemoExoticComponent<(inProps: ImageDotsProps) => React.JSX.Element>;
export default _default;
