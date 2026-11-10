import React from "react";
import { SxProps, Theme, TypographyProps } from "@mui/material";
/**
 * Props of {@link Loader}. Besides its own props, the Loader takes the HTML
 * attributes of a `div` (`id`, `style`, `data-*`, `aria-*`, event handlers,
 * ...) and passes them to its `root` slot, the status region, except
 * `aria-label` and `aria-labelledby`, which name the spinner's progressbar
 * instead of `text` or the default name.
 */
export interface LoaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
    /**
     * Optional status message to show, already translated. It wraps to the
     * Loader's width, also inside a word that is wider than that, so a long
     * translated word does not make the page scroll sideways. It also names
     * the spinner's progressbar, unless `aria-label` or `aria-labelledby` is
     * set. Without it (`undefined` or `""`) the progressbar is named
     * "Loading…", in the library's current language. Text and progressbar are
     * the content of the Loader's status region, so a changed text is
     * announced (see `aria-live`).
     */
    text?: string;
    /**
     * Typography variant of `text`: any variant MUI's `Typography` takes,
     * including `"inherit"` and the variants a theme adds through
     * `TypographyPropsVariantOverrides`. Ignored without `text`.
     * @default "h6"
     */
    typographyVariant?: TypographyProps["variant"];
    /**
     * Class name added to the `root` slot. As on MUI components, the styles
     * of `styled(Loader)` and of a parent's theme slot that is a Loader
     * (FormLoaderOverlay's `loader`) arrive this way and win over the Loader's
     * own `root` styles.
     */
    className?: string;
    /**
     * Class names added to the Loader's slots, one per {@link LoaderClassKey}:
     * `root` (together with `className`), `innerWrapper` and `progress`
     */
    classes?: Partial<Record<LoaderClassKey, string>>;
    /**
     * System styles for the `root` slot, as on MUI components
     */
    sx?: SxProps<Theme>;
    /**
     * Accessible name of the spinner's progressbar. It replaces the name the
     * Loader gives it otherwise: `text`, or without text "Loading…" in the
     * library's current language.
     */
    "aria-label"?: string;
    /**
     * Id (or space-separated ids) of the element(s) whose text names the
     * spinner's progressbar. Like `aria-label`, it replaces `text` and the
     * default name, and it wins over `aria-label`.
     */
    "aria-labelledby"?: string;
    /**
     * Politeness of the Loader's status region. The `root` slot has
     * `role="status"`, which makes its content (the text and the named
     * progressbar) a polite status message. Set `"off"` where many Loaders
     * show at once, such as one per chart on a dashboard, so that they do not
     * each announce themselves: the Loader stays a status, and its progressbar
     * keeps its name.
     * @default "polite", implied by `role="status"` (no attribute is set)
     */
    "aria-live"?: React.AriaAttributes["aria-live"];
}
/**
 * Theme style slots of {@link Loader}
 * (`components.CcLoader.styleOverrides.<slot>`), and the keys of its
 * `classes` prop:
 * - `root`: the outermost box, 100% of the parent's width and height, a flex
 *   column that centers `innerWrapper` vertically, and the Loader's status
 *   region (`role="status"`). It gets `className`, `sx` and the HTML
 *   attributes the Loader passes on. Theme
 *   `components.CcLoader.variants` apply to it. They match the Loader's `text`
 *   and `typographyVariant` after theme `defaultProps`, with
 *   `typographyVariant` `"h6"` when it is not set.
 * - `innerWrapper`: the block of text and spinner: a flex column that
 *   centers them horizontally, with `theme.spacing(1)` between them and
 *   `theme.spacing(2)` of padding above and below. It sets
 *   `overflow-wrap: anywhere`, so the text breaks inside a word that is wider
 *   than the Loader.
 * - `progress`: the MUI `CircularProgress`
 */
export type LoaderClassKey = "root" | "innerWrapper" | "progress";
/**
 * Indeterminate loading indicator: a MUI `CircularProgress` with an optional
 * status `text` above it, centered in its parent.
 *
 * Layout: text and spinner form one block. In a parent with a definite height
 * (a fixed height, or a box that a flex or grid layout stretches) the Loader
 * fills the parent and centers that block in it; a block taller than the
 * parent overflows it equally above and below. In a parent of automatic
 * height the Loader is as tall as the block: 72px without text (the 40px
 * spinner and 16px above and below it), and with text the text's height and
 * 8px more (at MUI's default spacing).
 *
 * Styling: `className`, `sx`, `style` and the other HTML attributes go to
 * the `root` slot, `classes` to the slot of each key, so `styled(Loader)`
 * styles the outer box.
 *
 * Accessibility: the `root` slot is a polite status region
 * (`role="status"`) around text and spinner, so screen readers announce the
 * loading; `aria-live="off"` silences it where many Loaders show at once.
 * Nothing in it is focusable. The spinner is a `progressbar`, named by
 * `text`, or without text "Loading…" in the library's current language.
 * `aria-label` and `aria-labelledby` replace that name. A status region
 * that mounts together with its content is not announced by every screen
 * reader: a message that must be heard belongs in a status region the app
 * keeps mounted. The Loader sets no `aria-busy`; that belongs on the region
 * whose content is loading. The Loader does not suspend, also not before
 * the library's translations have loaded, so it can be a Suspense fallback.
 *
 * Theme: `components.CcLoader.defaultProps` ({@link LoaderProps}),
 * `components.CcLoader.styleOverrides` per {@link LoaderClassKey} slot, and
 * `components.CcLoader.variants`, which apply to the `root` slot.
 */
declare const _default: React.MemoExoticComponent<(inProps: LoaderProps) => React.JSX.Element>;
export default _default;
