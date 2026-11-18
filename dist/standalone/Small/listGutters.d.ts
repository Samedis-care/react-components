import type { ListItemButtonProps, ListItemProps } from "@mui/material";
/**
 * The gutters of a Small `ListItem`: they apply unless `disableGutters` or
 * `disablePadding` is set, and the right one also not with a
 * `secondaryAction`, where MUI's 48px stay
 * @param left The left padding in px
 * @param right The right padding in px
 * @returns The style, with the gutters as variants on the item's props
 */
export declare const itemGutters: (left: number, right: number) => {
    variants: ({
        props: ({ disableGutters, disablePadding }: ListItemProps) => boolean;
        style: {
            paddingLeft: number;
            paddingRight?: undefined;
        };
    } | {
        props: (props: ListItemProps) => boolean;
        style: {
            paddingRight: number;
            paddingLeft?: undefined;
        };
    })[];
};
/**
 * The gutters of a Small `ListItemButton`: they apply unless
 * `disableGutters` is set
 * @param left The left padding in px
 * @param right The right padding in px
 * @returns The style, with the gutters as a variant on the button's props
 */
export declare const buttonGutters: (left: number, right: number) => {
    variants: {
        props: ({ disableGutters }: ListItemButtonProps) => boolean;
        style: {
            paddingLeft: number;
            paddingRight: number;
        };
    }[];
};
