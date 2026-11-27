import { alpha, darken, getContrastRatio, lighten } from "@mui/material";
import colorToRgba from "../../utils/colorToRgba";
import { matrixClasses, matrixVars } from "./matrixClasses";
/**
 * The column tints, as style objects keyed by state class.
 *
 * Body cells sit in the scroll flow, so they can be translucent. The sticky
 * header and row header must NOT be — content scrolls underneath them — so
 * those layer the same tint over an opaque background instead of blending with
 * whatever passes behind.
 */
const tint = (theme, variant) => {
    const dark = theme.palette.mode === "dark";
    switch (variant) {
        case "muted":
            // Neutral on purpose: a de-emphasized column must not read as
            // branded, so this tints with the text color (black on a light
            // theme, white on a dark one) rather than with the palette.
            return alpha(theme.palette.text.primary, dark ? 0.05 : 0.06);
        case "current":
            return alpha(theme.palette.warning.main, dark ? 0.16 : 0.14);
        case "accent":
            return alpha(theme.palette.info.main, dark ? 0.18 : 0.08);
    }
};
const stickyTint = (theme, variant) => {
    const dark = theme.palette.mode === "dark";
    switch (variant) {
        case "muted":
            return alpha(theme.palette.text.primary, 0.11);
        case "current":
            return alpha(theme.palette.warning.main, dark ? 0.16 : 0.14);
        case "accent":
            return alpha(theme.palette.info.main, 0.2);
    }
};
/**
 * The color a sticky cell of a variant shows: its tint over the paper.
 * @returns An rgb() color, or undefined if a palette color cannot be read
 */
const stickyBackground = (theme, variant) => {
    const paper = colorToRgba(theme.palette.background.paper);
    const layer = colorToRgba(stickyTint(theme, variant));
    if (!paper || !layer)
        return undefined;
    const [r, g, b] = [0, 1, 2].map((channel) => Math.round(layer[channel] * layer[3] + paper[channel] * (1 - layer[3])));
    return `rgb(${r}, ${g}, ${b})`;
};
/** WCAG 2 AA for normal-size text; the header label is 0.8rem bold */
const LABEL_CONTRAST = 4.5;
/** WCAG 2 AA for what identifies a state (1.4.11 Non-text Contrast) */
const RING_CONTRAST = 3;
/**
 * A color with a contrast ratio on the background of a variant's sticky
 * header: the given color if it has it, else the color darkened (on a dark
 * background: lightened) just enough, so it keeps its hue.
 * @param theme The theme
 * @param variant The column variant whose background the color is shown on
 * @param color The color meant to be shown
 * @param ratio The contrast ratio it needs
 * @returns A CSS color
 */
const readableOnSticky = (theme, variant, color, ratio) => {
    try {
        const background = stickyBackground(theme, variant);
        if (!background)
            return color;
        const toward = getContrastRatio("#000", background) >=
            getContrastRatio("#fff", background)
            ? darken
            : lighten;
        // in steps of 5%: at 100% the color is black (or white), which has
        // at least 4.58:1 on any background it was picked for
        let shown = color;
        for (let step = 1; step <= 20 && getContrastRatio(shown, background) < ratio; step++)
            shown = toward(color, step / 20);
        return shown;
    }
    catch {
        // a color MUI cannot decompose: keep it rather than fail the grid
        return color;
    }
};
/**
 * A label color for a sticky header of a variant: the given color if it has
 * LABEL_CONTRAST on that header's background, else the color darkened (on a
 * dark background: lightened) just enough, so it keeps its hue.
 * @param theme The theme
 * @param variant The column variant whose header the label sits on
 * @param color The color the label is meant to have
 * @returns A CSS color
 */
const readableStickyLabel = (theme, variant, color) => readableOnSticky(theme, variant, color, LABEL_CONTRAST);
/**
 * The label colors of the "current" and "accent" column headers, as the
 * custom properties the header labels read.
 * @remarks Set once on the grid root: the search for a readable color would
 * otherwise run in the style of every one of up to 400 header labels.
 */
export const columnLabelColorVars = (theme) => ({
    [matrixVars.currentLabelColor]: readableStickyLabel(theme, "current", theme.palette.mode === "dark"
        ? theme.palette.warning.light
        : theme.palette.warning.dark),
    [matrixVars.accentLabelColor]: readableStickyLabel(theme, "accent", theme.palette.info.main),
});
/** Translucent tints for the cells that scroll (body cells). */
export const columnTintStyles = (theme) => ({
    [`&.${matrixClasses.columnMuted}`]: {
        backgroundColor: tint(theme, "muted"),
    },
    [`&.${matrixClasses.columnCurrent}`]: {
        backgroundColor: tint(theme, "current"),
    },
    [`&.${matrixClasses.columnAccent}`]: {
        backgroundColor: tint(theme, "accent"),
    },
});
/**
 * Opaque tints for the sticky cells: a gradient of one flat color, layered over
 * the opaque paper background, tints the cell without making it see-through.
 */
export const stickyColumnTintStyles = (theme, accentExtra) => {
    const layer = (variant) => ({
        backgroundImage: `linear-gradient(${stickyTint(theme, variant)}, ${stickyTint(theme, variant)})`,
    });
    return {
        backgroundColor: theme.palette.background.paper,
        [`&.${matrixClasses.columnMuted}`]: layer("muted"),
        [`&.${matrixClasses.columnCurrent}`]: layer("current"),
        [`&.${matrixClasses.columnAccent}`]: { ...layer("accent"), ...accentExtra },
    };
};
/** One divider line on the right and the bottom of a cell. */
export const cellBorders = (theme) => ({
    borderRight: `1px solid ${theme.palette.divider}`,
    borderBottom: `1px solid ${theme.palette.divider}`,
});
/**
 * The attention ring around a highlighted entry, and around the "+N" marker
 * when an entry it stands for is highlighted, as the styles of the element it
 * is drawn around.
 *
 * The ring is warning.main, darkened (on a dark theme: lightened) until it has
 * 3:1 (WCAG 1.4.11) on today's column, whose tint is its own color. A line of
 * the grid's background between the element and the ring keeps the ring apart
 * from the element's fill, whatever its color (an orange entry in an orange
 * ring).
 * Forced colors drop box shadows: there the ring is an outline in the
 * Highlight system color.
 * @remarks A STATIC ring on purpose: an infinite CSS animation keeps the
 * compositor awake and drains battery on tablets as long as the grid is open.
 * A solid ring highlights just as clearly at zero cost.
 */
export const highlightRing = (theme) => {
    const ring = readableOnSticky(theme, "current", theme.palette.warning.main, RING_CONTRAST);
    // alpha(), not a hex-alpha suffix: the palette value can be rgb(), hsl() or
    // a CSS variable, and appending to those invalidates the whole declaration
    // — which would drop the ring entirely instead of just its glow.
    return {
        boxShadow: `0 0 0 1px ${theme.palette.background.paper}, 0 0 0 3px ${ring}, 0 0 6px 1px ${alpha(ring, 0.5)}`,
        "@media (forced-colors: active)": {
            outline: "3px solid Highlight",
        },
    };
};
/**
 * The focus ring of an entry (a split entry or a diagonal pair). It lies just
 * outside the entry, in the tile's padding, so it stands out from the grid's
 * background whatever the entry's fill is. A line of that background inside it
 * keeps it apart from the fill where something else surrounds the entry: the
 * highlight ring, the other entry of a split pair.
 */
export const entryFocusRing = (theme) => ({
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 0,
    boxShadow: `inset 0 0 0 1px ${theme.palette.background.paper}`,
});
