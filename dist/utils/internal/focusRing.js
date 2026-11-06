/**
 * The keyboard focus ring of a CC control, for its `&.Mui-focusVisible` state:
 * the ring MUI draws when the theme sets `focusVisible`, a 2px solid outline in
 * `palette.primary.main`. An outline, not a box-shadow, because forced colors
 * keep outlines (in a system color) and drop shadows.
 *
 * When the theme sets `focusVisible`, MUI's ButtonBase and Checkbox already draw
 * that ring, so this returns nothing and the theme's ring is the one shown.
 *
 * @param theme The theme
 * @param offset The outline offset in px: positive draws the ring outside the
 * element, -2 inside it (for an element whose container may clip it)
 * @returns The ring's styles, or undefined when the theme draws its own
 */
const focusRing = (theme, offset) => theme.focusVisible
    ? undefined
    : {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: offset,
    };
export default focusRing;
