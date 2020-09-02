const measureText = (font: string, text: string): TextMetrics => {
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d")!;
	ctx.font = font;
	return ctx.measureText(text);
};

export default measureText;
