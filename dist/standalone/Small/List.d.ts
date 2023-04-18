/// <reference types="react" />
import { ListItemIcon } from "@mui/material";
export declare const SmallListItem: ((props: {
    href: string;
} & {
    button: true;
} & import("@mui/material").ListItemBaseProps & {
    components?: {
        Root?: import("react").ElementType<any> | undefined;
    } | undefined;
    componentsProps?: {
        root?: (import("react").HTMLAttributes<HTMLDivElement> & import("@mui/material").ListItemComponentsPropsOverrides) | undefined;
    } | undefined;
    slotProps?: {
        root?: (import("react").HTMLAttributes<HTMLDivElement> & import("@mui/material").ListItemComponentsPropsOverrides) | undefined;
    } | undefined;
    slots?: {
        root?: import("react").ElementType<any> | undefined;
    } | undefined;
} & Omit<{
    action?: import("react").Ref<import("@mui/material").ButtonBaseActions> | undefined;
    centerRipple?: boolean | undefined;
    children?: import("react").ReactNode;
    classes?: Partial<import("@mui/material").ButtonBaseClasses> | undefined;
    disabled?: boolean | undefined;
    disableRipple?: boolean | undefined;
    disableTouchRipple?: boolean | undefined;
    focusRipple?: boolean | undefined;
    focusVisibleClassName?: string | undefined;
    LinkComponent?: import("react").ElementType<any> | undefined;
    onFocusVisible?: import("react").FocusEventHandler<any> | undefined;
    sx?: import("@mui/material").SxProps<import("@mui/material").Theme> | undefined;
    tabIndex?: number | undefined;
    TouchRippleProps?: Partial<import("@mui/material/ButtonBase/TouchRipple").TouchRippleProps> | undefined;
    touchRippleRef?: import("react").Ref<import("@mui/material/ButtonBase/TouchRipple").TouchRippleActions> | undefined;
}, "classes"> & import("@mui/material/OverridableComponent").CommonProps & Omit<Pick<import("react").DetailedHTMLProps<import("react").AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>, "key" | keyof import("react").AnchorHTMLAttributes<HTMLAnchorElement>> & {
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
} & import("@mui/material").ListItemBaseProps & {
    components?: {
        Root?: import("react").ElementType<any> | undefined;
    } | undefined;
    componentsProps?: {
        root?: (import("react").HTMLAttributes<HTMLDivElement> & import("@mui/material").ListItemComponentsPropsOverrides) | undefined;
    } | undefined;
    slotProps?: {
        root?: (import("react").HTMLAttributes<HTMLDivElement> & import("@mui/material").ListItemComponentsPropsOverrides) | undefined;
    } | undefined;
    slots?: {
        root?: import("react").ElementType<any> | undefined;
    } | undefined;
} & Omit<{
    action?: import("react").Ref<import("@mui/material").ButtonBaseActions> | undefined;
    centerRipple?: boolean | undefined;
    children?: import("react").ReactNode;
    classes?: Partial<import("@mui/material").ButtonBaseClasses> | undefined;
    disabled?: boolean | undefined;
    disableRipple?: boolean | undefined;
    disableTouchRipple?: boolean | undefined;
    focusRipple?: boolean | undefined;
    focusVisibleClassName?: string | undefined;
    LinkComponent?: import("react").ElementType<any> | undefined;
    onFocusVisible?: import("react").FocusEventHandler<any> | undefined;
    sx?: import("@mui/material").SxProps<import("@mui/material").Theme> | undefined;
    tabIndex?: number | undefined;
    TouchRippleProps?: Partial<import("@mui/material/ButtonBase/TouchRipple").TouchRippleProps> | undefined;
    touchRippleRef?: import("react").Ref<import("@mui/material/ButtonBase/TouchRipple").TouchRippleActions> | undefined;
}, "classes"> & import("@mui/material/OverridableComponent").CommonProps & Omit<Pick<import("react").DetailedHTMLProps<import("react").AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>, "key" | keyof import("react").AnchorHTMLAttributes<HTMLAnchorElement>> & {
    ref?: ((instance: HTMLAnchorElement | null) => void) | import("react").RefObject<HTMLAnchorElement> | null | undefined;
}, "className" | "style" | "classes" | "children" | "sx" | "button" | "tabIndex" | "autoFocus" | "disabled" | "action" | "selected" | "alignItems" | "dense" | "centerRipple" | "disableRipple" | "disableTouchRipple" | "focusRipple" | "focusVisibleClassName" | "LinkComponent" | "onFocusVisible" | "TouchRippleProps" | "touchRippleRef" | "components" | "componentsProps" | "slotProps" | "slots" | "disableGutters" | "divider" | "disablePadding" | "ContainerComponent" | "ContainerProps" | "secondaryAction">) => JSX.Element) & import("@mui/material/OverridableComponent").OverridableComponent<import("@mui/material").ExtendButtonBaseTypeMap<import("@mui/material").ListItemTypeMap<{
    button: true;
}, "div">>> & import("@mui/material/OverridableComponent").OverridableComponent<import("@mui/material").ListItemTypeMap<{
    button?: false | undefined;
}, "li">>;
export declare const SelectorSmallListItemButton: import("@mui/material").ExtendButtonBase<import("@mui/material").ListItemButtonTypeMap<{}, "div">>;
export declare const SmallListItemIcon: typeof ListItemIcon;
