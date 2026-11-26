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
export const edgesPast = (
	hidden: HTMLElement,
	container: Element | null = hidden.offsetParent,
): string[] => {
	if (!container)
		throw new Error("the hidden element is not laid out in a box");
	const border = container.getBoundingClientRect();
	const left = border.left + container.clientLeft;
	const top = border.top + container.clientTop;
	const right = container.clientWidth
		? left + container.clientWidth
		: border.right;
	const bottom = container.clientHeight
		? top + container.clientHeight
		: border.bottom;
	const box = hidden.getBoundingClientRect();
	return [
		box.left < left && "left",
		box.right > right && "right",
		box.top < top && "top",
		box.bottom > bottom && "bottom",
	].filter((edge): edge is string => !!edge);
};

/** Whether the page scrolls sideways (WCAG 1.4.10 Reflow at 320px) */
export const pageScrollsSideways = (): boolean =>
	document.documentElement.scrollWidth > document.documentElement.clientWidth;

/**
 * A story's `beforeEach` that makes the whole page right to left, for a dialog, which
 * renders outside the story's canvas. It restores the page's direction afterwards.
 * @returns The cleanup
 */
export const rightToLeftPage = (): (() => void) => {
	const before = document.documentElement.dir;
	document.documentElement.dir = "rtl";
	return () => {
		document.documentElement.dir = before;
	};
};
