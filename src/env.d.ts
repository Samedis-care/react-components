declare module "*.svg" {
	const value: string;
	export default value;
}

declare module "trim-canvas" {
	/**
	 * Trims transparent (alpha = 0) borders from a canvas.
	 * Mutates and returns the same canvas.
	 */
	export default function trimCanvas(
		canvas: HTMLCanvasElement,
	): HTMLCanvasElement;
}
