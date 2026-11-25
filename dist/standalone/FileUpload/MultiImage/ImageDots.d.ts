import React from "react";
export interface ImageDotsProps {
    /**
     * Total number of images. Nothing is rendered for fewer than two.
     */
    total: number;
    /**
     * Index of the currently active image (0-based): its dot is filled, or the counter shows
     * its position. An index out of range fills no dot and leaves the counter empty.
     */
    active: number;
    /**
     * Set currently active image, called when a dot is activated (click, Enter or Space).
     * Each dot is a button named after its position ("Image 2 of 3"); the active one has
     * `aria-current`.
     * @param active Image index
     */
    setActive: (active: number) => void;
    /**
     * CSS class for root
     */
    className?: string;
    /**
     * Optional style overrides: root, container (the row of dots), imageDot (each dot),
     * counter (the "2 / 30" shown instead of the dots when they do not all fit in one row)
     * and counterLabel (its visually hidden text for screen readers, "Image 2 of 30")
     */
    classes?: Partial<Record<ImageDotsClassKey, string>>;
}
export type ImageDotsClassKey = "root" | "container" | "imageDot" | "counter" | "counterLabel";
declare const _default: React.MemoExoticComponent<(inProps: ImageDotsProps) => React.JSX.Element>;
export default _default;
