import { useEffect, useState } from "react";

/** The region element and the generation of its text that may be rendered */
interface WrittenText {
	region: HTMLElement;
	generation: number;
}

/** What the generation of the text was counted from */
interface TextGeneration {
	open: boolean;
	role: string;
	/** Goes up each time the text must be written anew */
	count: number;
}

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
const useLiveRegionText = (
	open: boolean,
	role: string,
): [ref: (region: HTMLElement | null) => void, textShown: boolean] => {
	const [region, setRegion] = useState<HTMLElement | null>(null);
	const [generation, setGeneration] = useState<TextGeneration>(() => ({
		open,
		role,
		count: 0,
	}));
	// during render, so the text is withheld in the very update that opens the
	// region or changes its role
	if (generation.open !== open || generation.role !== role) {
		setGeneration((prev) => ({
			open,
			role,
			count:
				prev.role !== role || (open && !prev.open)
					? prev.count + 1
					: prev.count,
		}));
	}
	const [written, setWritten] = useState<WrittenText | null>(null);

	useEffect(() => {
		if (!region) return;
		// the first frame renders the region without the text, the second one
		// writes the text into it
		let frame = requestAnimationFrame(() => {
			frame = requestAnimationFrame(() =>
				setWritten({ region, generation: generation.count }),
			);
		});
		return () => cancelAnimationFrame(frame);
	}, [region, generation.count]);

	return [
		setRegion,
		written?.region === region && written.generation === generation.count,
	];
};

export default useLiveRegionText;
