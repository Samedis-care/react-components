import React from "react";
import { AccordionProps, TypographyProps } from "@mui/material";
/**
 * Keys of the theme's `components.CcInfoBox.styleOverrides`, also the keys of
 * the `classes` prop:
 * - `root`: the MUI `Accordion` around everything
 * - `summary`: the header, filled with the status color: the toggle button
 *   (`AccordionSummary`), or, while `alwaysExpanded` is `true`, a static
 *   `<span>` that looks the same, without MUI's `MuiAccordionSummary-*` and
 *   `MuiButtonBase-root` classes
 * - `summaryRoot`: the header content, the icon column and the heading, a
 *   `<span>` with `display: block`. It has `min-width: 0`, as has MUI's
 *   content wrapper around it, so it never grows wider than the header
 * - `iconButton`: the column with the status icon at the header's left edge
 * - `heading`: the heading `Typography`, a `<span>` with `display: block` in
 *   every `headingVariant`. It sets `overflow-wrap: anywhere`, so a word
 *   wider than the header breaks inside it
 * - `statusName`: the visually hidden status name read before the heading
 * - `details`: the bordered message panel (`AccordionDetails`). It sets
 *   `white-space: pre-line` and `overflow-wrap: anywhere`, which the message
 *   inherits
 * - `detailsText`: the `<div>` around `message`
 *
 * No slot receives an `ownerState`, and the theme has no `variants` for
 * InfoBox: a function override is called with the theme. The props are state
 * classes on the root and on the header instead: `CcInfoBox-statusInfo`
 * (`status` `info` or not set), `CcInfoBox-statusWarning`,
 * `CcInfoBox-statusSuccess` or `CcInfoBox-statusError`, and
 * `CcInfoBox-alwaysExpanded` while `alwaysExpanded` is `true`; an open box
 * also has MUI's `Mui-expanded` there. A theme styles a state with a
 * selector, e.g. `summary: { "&.CcInfoBox-statusError": { … } }`, or reaches
 * the other slots from the root, e.g.
 * `root: { "&.CcInfoBox-statusError .MuiAccordionDetails-root": { … } }`.
 *
 * A header background set for a status class stays while the header has
 * keyboard focus. One set for the header alone
 * (`summary: { backgroundColor }`) replaces the status colors, but the
 * focused header (`Mui-focusVisible`) shows the status color unless the
 * theme sets the background for `"&.Mui-focusVisible"` too.
 */
export type InfoBoxClassKey = "root" | "summary" | "summaryRoot" | "iconButton" | "heading"
/** The visually hidden status name read before the heading */
 | "statusName" | "details" | "detailsText";
export interface InfoBoxProps {
    /**
     * Title of the info box, shown in the header: text, or any node that may
     * stand inside a button, such as a `<Trans>` element or text with
     * emphasis. The whole header is a button, which must not hold a link or
     * another control (assistive technology reads its content as plain
     * text): put those into `message`. It names the header button, so it
     * must not be empty (`""`, `null`, `undefined`).
     * For a `warning`, `success` or `error` status the translated status is
     * read before it (e.g. "Warning: Please review"), so don't repeat the
     * status here.
     *
     * The heading wraps at spaces. A word wider than the header, such as a
     * long compound, a file name or a URL, breaks between any two characters,
     * so it stays inside the box on a phone. Content that cannot wrap (e.g. an
     * element with `white-space: nowrap`) runs past the header's end and is
     * cut off there.
     */
    heading: React.ReactNode;
    /**
     * Controlled expanded state, like MUI Accordion's `expanded`: `true`
     * shows the message, `false` shows only the header. The box shows this
     * value and follows every change of it. A click on the header does not
     * change it by itself: it calls `onChange` with the requested state, so
     * pass that back (`onChange={(_, next) => setOpen(next)}`) to let the
     * user toggle the box.
     *
     * Leave it unset (`undefined`) for a box the user toggles on its own,
     * starting at `defaultExpanded`. Decide at mount: switching between set
     * and unset later logs a MUI error in development; a value set later is
     * ignored, and removing the value closes the box.
     * While `alwaysExpanded` is `true` the box is open whatever this says.
     */
    expanded?: boolean;
    /**
     * Initial expanded state of a box without `expanded` (uncontrolled), like
     * MUI Accordion's `defaultExpanded`: `true` shows the message, `false`
     * only the header, until the user toggles it. Read once at mount: a later
     * change is ignored and logs a MUI error in development. Ignored while
     * `expanded` is set.
     * @default false
     */
    defaultExpanded?: boolean;
    /**
     * `true` keeps the box open: the message is shown and the user cannot
     * collapse it. The header is static then: the heading, still in the box's
     * heading element (`headingComponent`), without a toggle button, so it has
     * no `aria-expanded`, is no tab stop, its text can be selected and copied,
     * and a click on it calls no `onChange`. For a box the user may close,
     * pass `expanded` with `onChange`, or `defaultExpanded`, instead.
     *
     * `false` is the same as not set: the box shows `expanded`, or, without
     * it, the user opens and closes it starting at `defaultExpanded`, so a
     * condition can be passed directly (`alwaysExpanded={isLocked}`). A
     * change after mount takes effect: once it is no longer `true`, the box
     * shows `expanded`, or, without it, the state the user last toggled to
     * (initially `defaultExpanded`), and the user can toggle it again. A
     * header that has keyboard focus when it changes passes the focus on to
     * the header that replaces it.
     * While it is `true`, the root and the header have the class
     * `CcInfoBox-alwaysExpanded`.
     * @default false
     */
    alwaysExpanded?: boolean;
    /**
     * The message inside the info box: text or any node. It wraps at spaces.
     * A word wider than the panel, such as a long compound, a file name or a
     * URL, breaks between any two characters, so it stays inside the box on a
     * phone, also where the box sits in a flex row or a grid cell. A `"\n"` in
     * text starts a new line (the panel has `white-space: pre-line`). Both
     * rules are inherited by nested elements.
     */
    message: React.ReactNode;
    /**
     * Called when the user toggles the header (a click, or Enter or Space on
     * it), with the requested expanded state. Not called when `expanded`
     * changes. With `expanded` set, the box changes only once that new state
     * is passed back into `expanded`. Never called while `alwaysExpanded` is
     * `true`: the header is static then.
     * @param event The click event
     * @param expanded The requested expanded state: `true` to open the box
     */
    onChange?: AccordionProps["onChange"];
    /**
     * Typography variant of the heading: any variant MUI's `Typography`
     * takes, including `"inherit"` and the variants a theme adds through
     * `TypographyPropsVariantOverrides`. It sets only the look (font, size,
     * weight, line height): the heading is a `<span>` in every variant, with
     * the variant's class (`MuiTypography-<variant>`), and the box's heading
     * element and level are set by `headingComponent`. So `"h6"` does not
     * make a second heading of level 6, and `"body1"` puts no `<p>` into the
     * header button.
     * @default "caption"
     */
    headingVariant?: TypographyProps["variant"];
    /**
     * The element of the box's heading, which holds the header (the toggle
     * button, or the static header while `alwaysExpanded` is `true`), like
     * the `component` of MUI Accordion's `heading` slot. `"h1"` to `"h6"` set
     * the heading's level: pick the one that fits the page's outline, e.g.
     * `"h2"` for a box right below the page's `<h1>`. Any other element, e.g.
     * `"div"`, makes the header no heading, for a box that should not appear
     * in the page's outline. It holds the header button, so it must not be
     * interactive itself (no `button` or `a`).
     *
     * The look does not depend on it: MUI's heading slot resets every style
     * of the element (`all: unset`), and `headingVariant` sets the heading's
     * font.
     * @default "h3"
     */
    headingComponent?: React.ElementType;
    /**
     * custom class name to apply to root
     */
    className?: string;
    /**
     * Custom styles
     */
    classes?: Partial<Record<InfoBoxClassKey, string>>;
    /**
     * For which status InfoBox used. It sets the header's color, which stays
     * while the header has keyboard focus; the focused header shows a 2px
     * ring in its text color, 2px inside its edges. `warning`, `success` and
     * `error` also put the translated status in front of the heading, read
     * out with it (e.g. "Warning: Please review"), so the status is not
     * conveyed by color and icon alone. `info` and an unset status announce
     * nothing: they are the neutral default.
     *
     * The root and the header have the state class of the status:
     * `CcInfoBox-statusInfo` (also while it is not set),
     * `CcInfoBox-statusWarning`, `CcInfoBox-statusSuccess` or
     * `CcInfoBox-statusError`.
     */
    status?: "info" | "warning" | "success" | "error";
}
declare const _default: React.MemoExoticComponent<(inProps: InfoBoxProps) => React.JSX.Element>;
export default _default;
