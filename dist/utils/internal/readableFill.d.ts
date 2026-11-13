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
declare const readableFill: (fill: string, text: string) => string;
export default readableFill;
