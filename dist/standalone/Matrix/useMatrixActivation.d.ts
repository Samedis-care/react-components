import React from "react";
export interface MatrixActivationProps {
    role: "button";
    tabIndex: 0;
    "aria-label": string | undefined;
    onClick: () => void;
    onKeyDown: (event: React.KeyboardEvent) => void;
}
/**
 * Makes a plain element behave like a button: reachable by keyboard, activated
 * by Enter and Space, and named.
 *
 * A grid cell is not a button — only the action on it is — so these parts stay
 * divs rather than becoming MUI ButtonBase: that would put a ripple and a
 * button reset into a 46x58px cell, and render a <button> as a CSS grid item.
 * This keeps the semantics in one place instead of hand-rolling them per part.
 * The focus ring comes from each part's own styled slot (:focus-visible).
 * @param onActivate What the click or key press does. Undefined means the
 * element is not interactive and gets no props at all.
 * @param label Accessible name, if the element's own contents are not one
 * @returns The props to spread, or undefined
 */
declare const useMatrixActivation: (onActivate: (() => void) | undefined, label?: string) => MatrixActivationProps | undefined;
export default useMatrixActivation;
