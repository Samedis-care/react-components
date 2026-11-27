import React from "react";
import { SxProps, Theme } from "@mui/material";
/**
 * Keys of the theme's `components.CcGroupBox.styleOverrides`, also the keys
 * of the `classes` prop:
 * - `root`: the `<fieldset>` frame
 * - `legend`: the `<legend>` title. It sets `overflow-wrap: anywhere`, so a
 *   word wider than the frame breaks inside it.
 * - `smallLabel`: the legend while `smallLabel` is set. Its theme overrides
 *   apply after those of `legend`.
 * - `asterisk`: the asterisk after the title while `required` is set, a
 *   `<span>` in the legend with the class `CcGroupBox-asterisk`
 *
 * No slot receives an `ownerState`: a function override is called with the
 * theme. The small legend has the class `CcGroupBox-smallLabel`, so a
 * `legend` override can also style it with `"&.CcGroupBox-smallLabel"`.
 */
export type GroupBoxClassKey = "root" | "legend" | "smallLabel" | "asterisk";
/**
 * The HTML attributes of the GroupBox's fieldset, e.g. `aria-busy` or `aria-describedby`
 */
export type GroupBoxHTMLProps = Omit<React.ComponentPropsWithoutRef<"fieldset">, "children">;
/**
 * @remarks Every HTML attribute the box does not take itself is set on its fieldset, e.g.
 *          `aria-describedby` for an error shown next to the frame, or `aria-labelledby`
 *          for a frame without a title. A `ref` gets the fieldset.
 */
export interface GroupBoxProps extends GroupBoxHTMLProps {
    /**
     * Title drawn as the `<legend>` in the frame's top border, already
     * translated. It is also the group's accessible name.
     *
     * The values React renders as nothing, `null`, `undefined`, `false`,
     * `true` and `""`, render no legend: the frame has no title and the
     * group no name (name it with `aria-label` or `aria-labelledby`). Pass
     * `null` for a frame without a title, as `undefined` is replaced by a
     * `label` from the theme's `defaultProps`. Any other value is the legend,
     * as React renders it: `0` shows "0", `NaN` shows "NaN". An element always
     * renders a legend, even one that renders nothing, so a label that is only
     * the dirty marker of `labelWithDirtyMarker("", true)` keeps its legend, as
     * does a frame without a title while `dirty` is set.
     *
     * A title wider than the frame wraps at spaces. A word wider than the
     * frame, such as a long compound, a file name or a URL, breaks between any
     * two characters, so it stays inside the frame and the page does not
     * scroll sideways on a phone.
     */
    label: React.ReactNode;
    /**
     * Renders the legend at 0.75em of the inherited font size. The legend
     * then has the class `CcGroupBox-smallLabel` and `classes.smallLabel`, and
     * gets the theme's `styleOverrides.smallLabel`; a font size from the theme
     * replaces the 0.75em. Theme `variants` keyed on `smallLabel` match, and
     * style the fieldset (the legend through `"& > legend"`).
     * @default false
     */
    smallLabel?: boolean;
    /**
     * Marks the frame as the frame of a required field, as MUI's `required` marks
     * a FormLabel: an asterisk after the title (`classes.asterisk`), hidden from
     * assistive technology like MUI's, and a hidden "Required" in the user's
     * language that the fieldset's `aria-describedby` names before the ids passed
     * in `aria-describedby`, so a screen reader hears it when focus enters the
     * group. ARIA allows `aria-required` on neither a group nor a button, so the
     * frame says it this way. A frame without a title gets the description but no
     * asterisk. The text is a translation of the library, which suspends the frame
     * until it has loaded (the Framework's `Suspense` shows its fallback meanwhile).
     *
     * It is display only, like MUI's `required`: it neither validates nor blocks a
     * submit. Theme `variants` keyed on `required` match, with `required` `false`
     * when it is not set.
     * @default false
     */
    required?: boolean;
    /**
     * Marks the frame as the frame of a modified field, one whose value differs
     * from the server-side value: the library's dirty marker, a dot after the
     * title, and "(modified)" in the user's language in the group's name
     * ("Attachments (modified)"), as `labelWithDirtyMarker` adds them to a
     * label. The dot follows the asterisk of a required frame, as on a MUI field
     * with `dirty`. A frame without a title gets a legend with only the dot.
     * Pass the plain title in `label`: a label from `labelWithDirtyMarker` would
     * draw a second dot. Restyle the dot through the `CcDirtyMarker` theme
     * component. Theme `variants` keyed on `dirty` match, with `dirty` `false`
     * when it is not set.
     * @default false
     */
    dirty?: boolean;
    /**
     * Box contents
     */
    children?: React.ReactNode;
    /**
     * CSS class to apply to fieldset
     */
    className?: string;
    /**
     * Additional class names per {@link GroupBoxClassKey}: `root` is added to
     * the `<fieldset>`, `legend` to the `<legend>`, `smallLabel` to the
     * legend while `smallLabel` is set, and `asterisk` to the asterisk of a
     * required frame. As on MUI components, a `classes` prop
     * replaces the `classes` of the theme's `defaultProps` rather than adding
     * to them.
     */
    classes?: Partial<Record<GroupBoxClassKey, string>>;
    /**
     * System styles for the `<fieldset>`, as on MUI components. They apply after
     * GroupBox's own styles and the theme's `styleOverrides.root`. E.g.
     * `{ height: "100%" }` makes the frame fill a parent of definite height.
     */
    sx?: SxProps<Theme>;
}
/**
 * A frame with an optional title: a native `<fieldset>` whose `label` is drawn
 * as a `<legend>` in its top border.
 *
 * The frame is as wide as its parent and as tall as its content, in every
 * parent, as MUI's `Card` and `Paper` are: a frame in a side panel that is
 * stretched to the height of the form next to it ends below its last line.
 * To make it fill its parent, give it a height, as a `Card`:
 * `sx={{ height: "100%" }}` fills a parent of definite height, such as a Grid
 * item, which is stretched to its row, so frames in one Grid row are equally
 * tall. In a Grid item with `display: "flex"` the frame is stretched as a flex
 * item, without a height of its own. Its width and height include its
 * padding and border (`box-sizing: border-box`), so it fits its parent also
 * where `box-sizing` is `content-box`, e.g. on a page without MUI's
 * `CssBaseline`. A `max-height` on the parent does not limit the frame: it
 * encloses its content, and a parent with `overflow: auto` scrolls.
 *
 * Every other HTML attribute, `sx` and `ref` reach the fieldset. A framed
 * form control ties its error to the group with `aria-describedby`: screen
 * readers read it when focus enters the group. It marks a required field with
 * `required` and a modified one with `dirty`, drawn after the title in the
 * order of a MUI field: "Attachments *" and then the dirty marker's dot. A
 * frame without a title can be named by a heading inside it with
 * `aria-labelledby`.
 *
 * Theme: `components.CcGroupBox.defaultProps` ({@link GroupBoxProps}),
 * `styleOverrides` per {@link GroupBoxClassKey} slot, and `variants`, which
 * apply to the fieldset. A variant's `props` match `label`, `smallLabel`,
 * `required`, `dirty` and the fieldset's HTML attributes after the theme's
 * default props, with `smallLabel`, `required` and `dirty` `false` when they
 * are not set. A `props` function gets these
 * props directly: there is no `ownerState`. A variant reaches the legend
 * through a nested selector.
 *
 * @example
 * <GroupBox
 *   label={t("files")}
 *   required
 *   dirty={dirty}
 *   aria-describedby={"files-error"}
 * >…</GroupBox>
 * <FormHelperTextCC id={"files-error"} error>{errorMsg}</FormHelperTextCC>
 *
 * @example
 * // frames of equal height in one Grid row
 * <Grid container spacing={2}>
 *   <Grid size={{ xs: 12, md: 6 }}>
 *     <GroupBox label={t("service")} sx={{ height: "100%" }}>…</GroupBox>
 *   </Grid>
 *   <Grid size={{ xs: 12, md: 6 }}>
 *     <GroupBox label={t("contract")} sx={{ height: "100%" }}>…</GroupBox>
 *   </Grid>
 * </Grid>
 *
 * @example
 * // a theme that gives frames with a small legend a tighter frame
 * createTheme({ components: { CcGroupBox: { variants: [{
 *   props: { smallLabel: true },
 *   style: { padding: 4, "& > legend": { paddingInline: 2 } },
 * }] } } });
 */
declare const _default: React.NamedExoticComponent<GroupBoxProps & React.RefAttributes<HTMLFieldSetElement>>;
export default _default;
