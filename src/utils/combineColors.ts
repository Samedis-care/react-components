export default (color1: string, color2: string): number[] => {
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d")!;
	ctx.clearRect(0, 0, 1, 1);
	ctx.fillStyle = color1;
	ctx.fillRect(0, 0, 1, 1);
	ctx.fillStyle = color2;
	ctx.fillRect(0, 0, 1, 1);
	const ret: number[] = [];
	ctx.getImageData(0, 0, 1, 1).data.forEach((val) => ret.push(val));
	return ret;
};
