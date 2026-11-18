// The gutters replace MUI's 16px in the states MUI sets them in. They are
// variants on the props rather than nested selectors, so they stay plain
// declarations and sx, theme overrides and styled() wrappers still win.
const hasItemGutters = ({ disableGutters, disablePadding }) => !disableGutters && !disablePadding;
/**
 * The gutters of a Small `ListItem`: they apply unless `disableGutters` or
 * `disablePadding` is set, and the right one also not with a
 * `secondaryAction`, where MUI's 48px stay
 * @param left The left padding in px
 * @param right The right padding in px
 * @returns The style, with the gutters as variants on the item's props
 */
export const itemGutters = (left, right) => ({
    variants: [
        { props: hasItemGutters, style: { paddingLeft: left } },
        {
            // with secondaryAction the right padding stays MUI's 48px
            props: (props) => hasItemGutters(props) && !props.secondaryAction,
            style: { paddingRight: right },
        },
    ],
});
/**
 * The gutters of a Small `ListItemButton`: they apply unless
 * `disableGutters` is set
 * @param left The left padding in px
 * @param right The right padding in px
 * @returns The style, with the gutters as a variant on the button's props
 */
export const buttonGutters = (left, right) => ({
    variants: [
        {
            props: ({ disableGutters }) => !disableGutters,
            style: { paddingLeft: left, paddingRight: right },
        },
    ],
});
