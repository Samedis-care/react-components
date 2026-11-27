import React from "react";
import type { TFunction } from "i18next";
/**
 * What an entry's ring and fade show, in words, to follow its label:
 * ", highlighted", ", dimmed" or both.
 * @param t The library's translate function
 * @param highlighted Whether the entry is highlighted (MatrixTileItem.highlighted)
 * @param dimmed Whether the entry is dimmed (MatrixTileItem.dimmed)
 * @returns The words, each after a comma, or "" for neither
 */
export declare const tileStateText: (t: TFunction, highlighted: boolean | undefined, dimmed: boolean | undefined) => string;
export interface MatrixTileStateTextProps {
    /**
     * Whether the entry is highlighted (MatrixTileItem.highlighted)
     */
    highlighted?: boolean;
    /**
     * Whether the entry is dimmed (MatrixTileItem.dimmed)
     */
    dimmed?: boolean;
}
declare const _default: React.MemoExoticComponent<(props: MatrixTileStateTextProps) => React.JSX.Element>;
export default _default;
