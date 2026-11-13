import { darken, lighten } from "@mui/material/styles";
import { contrast, luminance, parseColor, TEXT_CONTRAST, } from "./readableTextColor";
/**
 * A fill as close to `fill` as text of the given color allows.
 *
 * Returns `fill` itself when `text`, laid over it, already reaches 4.5:1.
 * Otherwise it darkens the fill (behind light text) or lightens it (behind
 * dark text) by the smallest amount that does, so a state color such as
 * `palette.info.main` keeps its hue while the text on it becomes readable.
 * A color this cannot parse (a CSS variable, a keyword) or a translucent fill
 * is returned as is.
 * @param fill The background the text sits on
 * @param text The text's color, also a translucent one (MUI's dark text is
 * 87% black)
 * @returns The background to render
 */
const readableFill = (fill, text) => {
    const background = parseColor(fill);
    const foreground = parseColor(text);
    if (!background || !foreground || background[3] !== 1)
        return fill;
    /** The text's luminance as it shows on a background */
    const textLuminance = (behind) => {
        const [r, g, b, a] = foreground;
        return luminance([r, g, b].map((channel, i) => channel * a + behind[i] * (1 - a)));
    };
    const textContrast = (candidate) => contrast(textLuminance(candidate), luminance(candidate));
    if (textContrast(background) >= TEXT_CONTRAST)
        return fill;
    // away from the text: darker behind light text, lighter behind dark text
    const shift = textLuminance(background) > luminance(background) ? darken : lighten;
    // the smallest shift that reaches the ratio: contrast grows with the shift
    let low = 0;
    let high = 1;
    for (let step = 0; step < 12; step++) {
        const middle = (low + high) / 2;
        const candidate = parseColor(shift(fill, middle));
        if (candidate && textContrast(candidate) >= TEXT_CONTRAST)
            high = middle;
        else
            low = middle;
    }
    return shift(fill, high);
};
export default readableFill;
