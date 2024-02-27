/// <reference types="react" />
import { ListItemIcon } from "@mui/material";
export declare const SmallListItem: ((props: {
    href: string;
} & {
    button: true;
} & import("@mui/material").ListItemOwnProps & Omit<import("@mui/material").ButtonBaseOwnProps, "classes"> & import("@mui/material/OverridableComponent").CommonProps & Omit<Pick<import("react").DetailedHTMLProps<import("react").AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>, "key" | keyof import("react").AnchorHTMLAttributes<HTMLAnchorElement>> & {
    ref?: ((instance: HTMLAnchorElement | null) => void) | import("react").RefObject<HTMLAnchorElement> | null | undefined;
}, "className" | "style" | "classes" | "children" | "sx" | "button" | "tabIndex" | "autoFocus" | "disabled" | "action" | "selected" | "alignItems" | "dense" | "centerRipple" | "disableRipple" | "disableTouchRipple" | "focusRipple" | "focusVisibleClassName" | "LinkComponent" | "onFocusVisible" | "TouchRippleProps" | "touchRippleRef" | "components" | "componentsProps" | "slotProps" | "slots" | "disableGutters" | "divider" | "disablePadding" | "ContainerComponent" | "ContainerProps" | "secondaryAction">) => JSX.Element) & import("@mui/material/OverridableComponent").OverridableComponent<import("@mui/material").ExtendButtonBaseTypeMap<import("@mui/material").ListItemTypeMap<{
    button: true;
}, "div">>> & import("@mui/material/OverridableComponent").OverridableComponent<import("@mui/material").ListItemTypeMap<{
    button?: false | undefined;
}, "li">>;
export declare const SmallListItemButton: import("@mui/material").ExtendButtonBase<import("@mui/material").ListItemButtonTypeMap<{}, "div">>;
export declare const SelectorSmallListItem: ((props: {
    href: string;
} & {
    button: true;
} & import("@mui/material").ListItemOwnProps & Omit<import("@mui/material").ButtonBaseOwnProps, "classes"> & import("@mui/material/OverridableComponent").CommonProps & Omit<Pick<import("react").DetailedHTMLProps<import("react").AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>, "key" | keyof import("react").AnchorHTMLAttributes<HTMLAnchorElement>> & {
    ref?: ((instance: HTMLAnchorElement | null) => void) | import("react").RefObject<HTMLAnchorElement> | null | undefined;
}, "className" | "style" | "classes" | "children" | "sx" | "button" | "tabIndex" | "autoFocus" | "disabled" | "action" | "selected" | "alignItems" | "dense" | "centerRipple" | "disableRipple" | "disableTouchRipple" | "focusRipple" | "focusVisibleClassName" | "LinkComponent" | "onFocusVisible" | "TouchRippleProps" | "touchRippleRef" | "components" | "componentsProps" | "slotProps" | "slots" | "disableGutters" | "divider" | "disablePadding" | "ContainerComponent" | "ContainerProps" | "secondaryAction">) => JSX.Element) & import("@mui/material/OverridableComponent").OverridableComponent<import("@mui/material").ExtendButtonBaseTypeMap<import("@mui/material").ListItemTypeMap<{
    button: true;
}, "div">>> & import("@mui/material/OverridableComponent").OverridableComponent<import("@mui/material").ListItemTypeMap<{
    button?: false | undefined;
}, "li">>;
export declare const SelectorSmallListItemButton: import("@mui/material").ExtendButtonBase<import("@mui/material").ListItemButtonTypeMap<{}, "div">>;
export declare const SmallListItemIcon: typeof ListItemIcon;
