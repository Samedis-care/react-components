import React from "react";
import { GroupBoxHTMLProps } from "../GroupBox";
import { SxProps, Theme } from "@mui/material";
/**
 * @remarks Every HTML attribute the box does not take itself is set on its frame, the
 *          `<fieldset>`, e.g. `aria-label` for a box without a title. A `ref` gets the
 *          fieldset.
 */
export interface HowToBoxProps extends GroupBoxHTMLProps {
    /**
     * Title of the box, drawn as the frame's `<legend>` and naming its group,
     * already translated.
     *
     * Omitted (`undefined`), it is the default "How it works", translated by
     * components-care (key `standalone.how-it-works.title`); a theme's
     * `defaultProps.titleLabel` replaces that default. Any other value is the
     * `label` of the {@link GroupBox}: `null`, `""` and `false` show no title,
     * even with a theme default, and leave the group without a name, which
     * `aria-label` can give it.
     *
     * The default names no task. Where a page shows more than one box, or where
     * the title should say what the steps are for, pass a title that names the
     * task, e.g. "How to import", so each box has a name of its own.
     *
     * The title looks like the legend of a GroupBox, including the theme's
     * `CcGroupBox` overrides of `legend`. The `legend` slot of `CcHowToBox`
     * styles it apart, e.g. as a heading where GroupBox legends look like
     * form-field labels (see {@link HowToBoxClassKey}).
     * @default "How it works" (localized)
     */
    titleLabel?: React.ReactNode;
    /**
     * The id of the frame, the `<fieldset>`. The list of entries gets the id
     * `` `${id}-list` ``: point a control's `aria-describedby` at it, and screen
     * readers read the entries as the control's description, e.g. for an
     * upload button below the box. Pointed at the frame's id, the description
     * is only the frame's accessible name, its title, not the entries.
     *
     * Without an id, the list has none either.
     */
    id?: string;
    /**
     * How to entries. An array renders one list item per element; any other
     * value renders as a single item.
     *
     * Entries that React renders as nothing (`undefined`, `null`, `""`, `false`
     * and `true`) are skipped, so a conditional step (`[a, isAdmin && b, c]`)
     * or an empty string in a translated array leaves no empty bullet. `0` is
     * an entry and shows "0", as React renders it. An element is always an
     * entry, even if its component renders nothing.
     *
     * Without entries the box renders nothing, not even its frame and title:
     * a skipped value, an empty array and an array of skipped values hide it.
     *
     * A line break `"\n"` in an entry starts a new line inside the same item,
     * which is the only way to break a line in a translated string. Other runs
     * of white space collapse to one space, as in normal text.
     *
     * Translated entries come from the app's own `t`: for a key that holds a
     * list, `translatedStrings(t(key, { returnObjects: true }))` gives its
     * strings, interpolated with the values passed to `t`, and can be spread
     * next to rich entries, such as a `<Trans>` with a link (see the
     * examples of HowToBox).
     *
     * An entry wraps at spaces. A word wider than the entry, such as a long
     * compound, a file name or a URL, breaks between any two characters, so it
     * stays inside the frame and the page does not scroll sideways on a phone.
     *
     * Entries stand half a spacing unit apart (`theme.spacing(0.5)`, 4px with
     * the default spacing). A single entry (a value that is not an array, or
     * an array with one entry left after skipping) shows without a bullet or
     * number and without the list's indent; it is still a list of one item.
     */
    labels: string[] | React.ReactNode[] | string | React.ReactNode | undefined;
    /**
     * Numbers the entries, as the steps of a procedure: the list is an `<ol>`
     * numbered 1., 2., 3., so a step can be referred to by its number.
     * Without it, the list is a `<ul>` with a bullet per entry, for entries
     * that are no sequence, such as tips or notes. A single entry shows
     * neither.
     *
     * The theme's `components.CcHowToBox.defaultProps.ordered` numbers every
     * box of an app; `ordered={false}` then bullets one box. Theme `variants`
     * match it as a boolean, `false` when it is omitted.
     * @default false
     */
    ordered?: boolean;
    /**
     * CSS class to apply to the frame, the `<fieldset>`
     */
    className?: string;
    /**
     * Additional class names per {@link HowToBoxClassKey}: `root` is added to
     * the frame, the `<fieldset>`, `legend` to its title, `ul` to the list and
     * `li` to each entry.
     *
     * As on MUI components, a `classes` prop replaces the `classes` of the
     * theme's `defaultProps`. The title's class is passed on as the frame
     * GroupBox's `classes`, so `legend` also replaces the `classes` of
     * `CcGroupBox`'s `defaultProps` for this box's frame.
     */
    classes?: Partial<Record<HowToBoxClassKey, string>>;
    /**
     * System styles for the frame, the `<fieldset>`, as on MUI components.
     * They apply after the theme's `styleOverrides.root` and `variants`.
     */
    sx?: SxProps<Theme>;
}
/**
 * Keys of the theme's `components.CcHowToBox.styleOverrides`, also the keys
 * of the `classes` prop:
 * - `root`: the GroupBox `<fieldset>` frame
 * - `legend`: the title, the frame's `<legend>`. Its overrides apply over the
 *   GroupBox's legend styles, including the theme's `CcGroupBox` overrides of
 *   `legend`: what they leave out still comes from those.
 * - `ul`: the list, a `<ul>`, or an `<ol>` with `ordered`. It indents the
 *   entries by 1.5rem for their markers. While it holds a single entry it
 *   has the class `CcHowToBox-singleEntry`, which removes the marker and the
 *   indent; an override styles it with `"&.CcHowToBox-singleEntry"`.
 * - `li`: each entry. It sets `white-space: pre-line` and
 *   `overflow-wrap: anywhere`, so a word wider than the entry breaks inside
 *   it, and half a spacing unit of `margin-top` on every entry but the
 *   first. A `marginTop` in its override replaces that gap, also on the
 *   first entry unless the override scopes it to
 *   `"&:not(:first-of-type)"`.
 *
 * No slot receives an `ownerState`: a function override is called with the
 * theme. To style a box by its props, use theme `variants`, which apply to
 * the frame and reach the list and its entries through nested selectors.
 */
export type HowToBoxClassKey = "root" | "legend" | "ul" | "li";
/**
 * Instructions in a frame: a {@link GroupBox} titled "How it works" (or
 * `titleLabel`, or untitled for `titleLabel={null}`) around a list with one
 * item per entry of `labels`, bulleted, or numbered with `ordered`. A single
 * entry shows without a marker.
 *
 * The box is as wide as its parent and, like MUI's text components, sets no
 * maximum line length: the page or dialog that holds it sets its width. To
 * wrap long entries at about 80 characters on a wide page, a theme sets
 * `styleOverrides.ul: { maxWidth: "80ch" }` (see the examples).
 *
 * Every other HTML attribute, `sx` and `ref` reach the frame's `<fieldset>`,
 * as they reach a {@link GroupBox}: `aria-label` names a box without a title.
 * With an `id`, the list gets `` `${id}-list` ``, so a control can be
 * described by the entries with `aria-describedby`.
 *
 * Theme: `components.CcHowToBox.defaultProps` ({@link HowToBoxProps}),
 * `styleOverrides` per {@link HowToBoxClassKey} slot, and `variants`, which
 * apply to the frame. A variant's `props` match `titleLabel` and `labels` as
 * HowToBox gets them, after the theme's default props, and `ordered` as a
 * boolean. A `props` function gets these props directly: there is no
 * `ownerState`. A variant reaches the list and its entries through nested
 * selectors.
 *
 * @example
 * // the upload button is described by the steps above it
 * <HowToBox id={"import-how-to"} labels={steps} />
 * <Button aria-describedby={"import-how-to-list"}>{t("upload")}</Button>
 *
 * @example
 * // numbered steps
 * <HowToBox ordered labels={["Download the template", "Upload it below"]} />
 *
 * @example
 * // translated steps: a link of the app's own, then the strings of the
 * // translated array "how-to.steps", interpolated with count
 * <HowToBox
 *   titleLabel={t("how-to.title")}
 *   labels={[
 *     <Trans key={"link"} t={t} i18nKey={"how-to.link"}
 *       components={{ dl: <Link href={templateUrl} /> }} />,
 *     ...translatedStrings(t("how-to.steps", { returnObjects: true, count })),
 *   ]}
 * />
 *
 * @example
 * // a theme that numbers the entries of every box and wraps them at about
 * // 80 characters
 * createTheme({ components: { CcHowToBox: {
 *   defaultProps: { ordered: true },
 *   styleOverrides: { ul: { maxWidth: "80ch" } },
 * } } });
 *
 * @example
 * // a theme that sets the entries of boxes with their own title in bold
 * createTheme({ components: { CcHowToBox: { variants: [{
 *   props: ({ titleLabel }) => titleLabel != null,
 *   style: { "& li": { fontWeight: "bold" } },
 * }] } } });
 *
 * @example
 * // a theme whose GroupBox legends look like form-field labels gives the
 * // how-to title the size of the entries in medium weight, as a heading
 * createTheme({ components: {
 *   CcGroupBox: { styleOverrides: { legend: { fontSize: "0.75rem" } } },
 *   CcHowToBox: { styleOverrides: { legend: ({ theme }) => ({
 *     fontSize: "inherit",
 *     fontWeight: theme.typography.fontWeightMedium,
 *     color: theme.palette.text.primary,
 *   }) } },
 * } });
 */
declare const _default: React.NamedExoticComponent<HowToBoxProps & React.RefAttributes<HTMLFieldSetElement>>;
export default _default;
