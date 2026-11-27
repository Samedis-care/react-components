/**
 * Holds back the text of a live region (an element with role="status" or
 * "alert") until the region has been in the page, empty and with its role, for
 * a rendered frame. Screen readers announce a change to a region they already
 * know; a region inserted with its text already in it is often not announced
 * (a polite one especially), and neither is a text that comes with a new role.
 *
 * The text is withheld, and written into the region two animation frames
 * later, when the region element is new (it was not in the page), each time
 * `open` turns true (so the same text is announced again) and when `role`
 * changes. While it is withheld nothing of it may be rendered: unmount it (its
 * components mount again once it is written), don't hide it.
 * @param open Is the region's content shown? Turning true writes the text anew;
 * turning false keeps the text that is in
 * @param role The region's role: a change writes the text anew
 * @returns The callback ref for the region element, and whether its text may be
 * rendered into it
 */
declare const useLiveRegionText: (open: boolean, role: string) => [ref: (region: HTMLElement | null) => void, textShown: boolean];
export default useLiveRegionText;
