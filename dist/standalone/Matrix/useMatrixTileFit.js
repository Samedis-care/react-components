import { useLayoutEffect } from "react";
import { matrixVars } from "./matrixClasses";
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
const useMatrixTileFit = (entry, content, minScale) => {
    // before the browser paints, so the first frame already shows the scale
    useLayoutEffect(() => {
        const room = entry.current;
        const inner = content.current;
        if (!room || !inner || typeof ResizeObserver === "undefined")
            return;
        let roomSize;
        let innerSize;
        let applied = 1;
        // the sizes come with the notification: reading them from the
        // elements would force a layout per entry
        const observer = new ResizeObserver((records) => {
            for (const record of records) {
                if (record.target === room)
                    roomSize = record.contentRect;
                else
                    innerSize = record.contentRect;
            }
            if (!roomSize || !innerSize)
                return;
            const needed = Math.min(1, innerSize.width > 0 ? roomSize.width / innerSize.width : 1, innerSize.height > 0 ? roomSize.height / innerSize.height : 1);
            const scale = Math.max(Math.min(1, minScale), needed);
            if (scale === applied)
                return;
            applied = scale;
            if (scale < 1)
                inner.style.setProperty(matrixVars.tileFit, String(scale));
            else
                inner.style.removeProperty(matrixVars.tileFit);
        });
        observer.observe(room);
        observer.observe(inner);
        return () => {
            observer.disconnect();
            inner.style.removeProperty(matrixVars.tileFit);
        };
    }, [entry, content, minScale]);
};
export default useMatrixTileFit;
