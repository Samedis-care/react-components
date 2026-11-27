/**
 * The edges of a box that the 1px box of a visually hidden, absolutely positioned
 * element lies past. A box past an edge of its containing block (the nearest
 * positioned ancestor, which places it) reaches into what surrounds that block: past
 * the edge a page or a scrolling container scrolls to, it scrolls that sideways.
 * @param hidden The visually hidden element
 * @param container The element whose padding box it must lie in. Default: its
 * containing block
 * @returns "left", "right", "top" and "bottom" for each edge it lies past; empty when
 * it lies inside
 */
export declare const edgesPast: (hidden: HTMLElement, container?: Element | null) => string[];
/** Whether the page scrolls sideways (WCAG 1.4.10 Reflow at 320px) */
export declare const pageScrollsSideways: () => boolean;
/**
 * A story's `beforeEach` that makes the whole page right to left, for a dialog, which
 * renders outside the story's canvas. It restores the page's direction afterwards.
 * @returns The cleanup
 */
export declare const rightToLeftPage: () => (() => void);
