// credits: https://stackoverflow.com/a/19366389

const colorToRgba = (color: string): number[] | undefined => {
	// Jest patch, not used in prod
	if (process && process.env && process.env.JEST_WORKER_ID) return [1, 1, 1, 1];

	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Failed getting Canvas 2D context");
	ctx.clearRect(0, 0, 1, 1);
	// In order to detect invalid values,
	// we can't rely on col being in the same format as what fillStyle is computed as,
	// but we can ask it to implicitly compute a normalized value twice and compare.
	ctx.fillStyle = "#000";
	ctx.fillStyle = color;
	const computed = ctx.fillStyle;
	ctx.fillStyle = "#fff";
	ctx.fillStyle = color;
	if (computed !== ctx.fillStyle) {
		return; // invalid color
	}
	ctx.fillRect(0, 0, 1, 1);
	const ret: number[] = [];
	ctx.getImageData(0, 0, 1, 1).data.forEach((val) => ret.push(val));
	return ret;
};

export default colorToRgba;
