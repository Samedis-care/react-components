import React from "react";
/**
 * Keeps an entry's content (its label, the arrow and the secondary label)
 * inside the entry: when the content is wider or taller than the entry, it
 * is scaled down, as a whole, just far enough to fit, and never below
 * minScale. Content that fits is left at its size.
 *
 * The content has to keep its natural size in the layout (no flex shrink),
 * so what is measured is what it needs, and it is scaled through the
 * tileFit custom property (a CSS scale, which changes nothing in the layout,
 * so a new scale never triggers another measurement). It follows every
 * change of either size: a narrower column, another label, a font that
 * finishes loading, or text spacing a user applies (WCAG 1.4.12).
 *
 * Without ResizeObserver (jsdom) nothing is scaled.
 * @param entry The entry, whose content box is the room there is
 * @param content The content, sized by what it holds
 * @param minScale The smallest scale to draw the content at; content that
 * does not fit even at this scale is drawn at it, and cut by the entry
 */
declare const useMatrixTileFit: (entry: React.RefObject<HTMLElement | null>, content: React.RefObject<HTMLElement | null>, minScale: number) => void;
export default useMatrixTileFit;
