import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import React, { useMemo } from "react";
import GroupBox from "../GroupBox";
import useCCTranslations from "../../utils/useCCTranslations";
import { styled, useThemeProps } from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";
/**
 * What MUI keeps off a root slot, plus HowToBox's own props. `classes` is
 * forwarded: it is the GroupBox's, which carries the class of the title.
 */
const ROOT_PROPS_NOT_FORWARDED = new Set([
    "titleLabel",
    "labels",
    "ordered",
    "ownerState",
    "theme",
    "sx",
    "as",
]);
const GroupBoxStyled = styled(GroupBox, {
    name: "CcHowToBox",
    slot: "root",
    shouldForwardProp: (prop) => !ROOT_PROPS_NOT_FORWARDED.has(prop),
    // The GroupBox renders the title, so the legend overrides reach it through
    // the frame, as MUI styles the parts of an inner component. The selector
    // is more specific than the legend's own class, so these overrides win over
    // the theme's CcGroupBox legend overrides.
    overridesResolver: (_props, styles) => [
        styles.root,
        { "& > legend": styles.legend },
    ],
})({});
/**
 * State class of the list while it holds a single entry
 */
const SINGLE_ENTRY_CLASS = "CcHowToBox-singleEntry";
/**
 * The list, a `<ul>`, or an `<ol>` (`as`) with `ordered`
 */
const List = styled("ul", { name: "CcHowToBox", slot: "ul" })({
    paddingLeft: "1.5rem",
    // a marker in front of the only entry marks nothing. As MUI's state
    // classes, the rule wins over a plain `ul` override (a theme's marker
    // type or indent), and an override styles it with the same selector.
    [`&.${SINGLE_ENTRY_CLASS}`]: {
        listStyleType: "none",
        paddingLeft: 0,
    },
});
const ListItem = styled("li", { name: "CcHowToBox", slot: "li" })(({ theme }) => ({
    whiteSpace: "pre-line",
    // a word wider than the entry (a German compound, a file name or a URL
    // on a phone) breaks inside, so it stays in the frame and does not
    // widen the page, also where the box sits in a flex row or a grid cell
    overflowWrap: "anywhere",
    // a gap between entries, so an entry of several lines does not run into
    // the next. :where() keeps the rule at zero specificity, so a margin in
    // the theme's `li` override or in classes.li replaces it, although
    // emotion puts nested rules after the plain ones. The leading * stops
    // emotion from reading the selector as a pseudo-class of the entry.
    "*:where(&:not(:first-of-type))": {
        marginTop: theme.spacing(0.5),
    },
}));
/** whether React renders the entry as nothing */
const isEmptyEntry = (entry) => entry == null || typeof entry === "boolean" || entry === "";
const HowToBox = React.forwardRef(function HowToBox(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: "CcHowToBox" });
    const { titleLabel, labels, ordered, className, classes, ...frameProps } = props;
    const { t } = useCCTranslations();
    const legendClass = classes?.legend;
    // without a class of its own, the GroupBox keeps the classes of its theme's
    // defaultProps, which a classes object would replace
    const groupBoxClasses = useMemo(() => (legendClass ? { legend: legendClass } : undefined), [legendClass]);
    const entries = (Array.isArray(labels) ? labels : [labels]).filter((entry) => !isEmptyEntry(entry));
    if (entries.length === 0)
        return _jsx(_Fragment, {});
    return (_jsx(GroupBoxStyled, { ...frameProps, ref: ref, titleLabel: titleLabel, labels: labels, ordered: !!ordered, label: titleLabel === undefined
            ? t("standalone.how-it-works.title")
            : titleLabel, className: combineClassNames([className, classes?.root]), classes: groupBoxClasses, children: _jsx(List, { as: ordered ? "ol" : undefined, id: frameProps.id ? `${frameProps.id}-list` : undefined, className: combineClassNames([
                classes?.ul,
                entries.length === 1 && SINGLE_ENTRY_CLASS,
            ]), children: entries.map((entry, i) => (_jsx(ListItem, { className: classes?.li, children: entry }, i))) }) }));
});
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
export default React.memo(HowToBox);
