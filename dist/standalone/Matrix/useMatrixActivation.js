import { useCallback, useMemo } from "react";
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
const useMatrixActivation = (onActivate, label) => {
    const handleClick = useCallback(() => {
        onActivate?.();
    }, [onActivate]);
    const handleKeyDown = useCallback((event) => {
        if (event.key !== "Enter" && event.key !== " ")
            return;
        // A held key auto-repeats; a native button fires once.
        if (event.repeat)
            return;
        event.preventDefault();
        onActivate?.();
    }, [onActivate]);
    return useMemo(() => onActivate
        ? {
            role: "button",
            tabIndex: 0,
            "aria-label": label,
            onClick: handleClick,
            onKeyDown: handleKeyDown,
        }
        : undefined, [onActivate, label, handleClick, handleKeyDown]);
};
export default useMatrixActivation;
