import React from "react";
export interface MuiPickerUtilsProps {
    /**
     * Renders only the children, for an app that brings its own
     * `LocalizationProvider` (`Framework`'s `disableMuiPickerUtils`).
     * Default: `false`
     */
    disable?: boolean;
    /**
     * The content, whose date pickers use the provider
     */
    children: React.ReactElement;
}
declare const _default: React.MemoExoticComponent<(props: MuiPickerUtilsProps) => React.ReactElement>;
export default _default;
