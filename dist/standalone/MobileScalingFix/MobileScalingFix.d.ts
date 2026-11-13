import React from "react";
/**
 * Props of {@link MobileScalingFix}; Framework takes them as
 * `mobileScalingFixProps`.
 */
export interface MobileScalingFixProps {
    /**
     * Minimum layout width in CSS px, written as `width=<minWidth>` (rounded
     * to an integer): screens narrower than this lay the page out this wide.
     * Omitted, 0 or NaN: `width=device-width`.
     */
    minWidth?: number;
}
declare const _default: React.MemoExoticComponent<(props: MobileScalingFixProps) => React.JSX.Element | null>;
export default _default;
