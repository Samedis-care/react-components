import React from "react";
export interface NumberFormatterProps {
    /**
     * The number to format
     */
    value: number | null | undefined;
    /**
     * Formatting options
     */
    options?: Intl.NumberFormatOptions;
}
declare const _default: React.MemoExoticComponent<(props: NumberFormatterProps) => React.JSX.Element>;
export default _default;
