/**
 * Hides an element from sight and keeps it for assistive technology, as MUI's
 * `visuallyHidden` does, for a text that is only read out (a status region, a name,
 * instructions). Unlike MUI's, it places the element's 1px box in the top left corner
 * of its containing block (the nearest positioned ancestor), without a -1px margin,
 * so the box always lies inside that block. MUI's box sits where the element would
 * follow the content, moved 1px back by the margin: at the start edge of its
 * container that is 1px outside, which in a right-to-left part of a left-to-right page
 * (or the reverse) lies on the side the page scrolls to, and the page scrolls sideways
 * by 1px.
 *
 * Use it as the style of a slot, `styled("span", { name, slot })(visuallyHidden)`,
 * so a theme can still restyle the slot.
 */
const visuallyHidden = {
    border: 0,
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
};
export default visuallyHidden;
