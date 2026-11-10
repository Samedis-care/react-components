import React from "react";
export interface VerticalDividerProps {
    /**
     * CSS class names to apply
     */
    className?: string;
    /**
     * Lets the divider sit directly in a flex row and take the row's height,
     * as `flexItem` does on MUI `<Divider orientation="vertical" />`: it is
     * stretched (`align-self: stretch`, `height: auto`), also when the row
     * centers its items, and in a MUI `Toolbar`. The element gets the class
     * `CcVerticalDivider-flexItem`.
     *
     * Default `false`: `height: 100%` of its parent, for a parent with a
     * definite height or a block wrapper that a stretching flex row sizes.
     * Inside such a wrapper `flexItem` makes it 0px tall, because the wrapper
     * is not a flex container.
     */
    flexItem?: boolean;
}
export type VerticalDividerClassKey = "root";
declare const _default: React.NamedExoticComponent<VerticalDividerProps & React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export default _default;
