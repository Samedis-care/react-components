var measureText = function (font, text) {
    // Jest patch, not used in prod
    if (process && process.env && process.env.JEST_WORKER_ID)
        return new TextMetrics();
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    if (!ctx)
        throw new Error("Couldn't get Canvas 2D context");
    ctx.font = font;
    return ctx.measureText(text);
};
export default measureText;
