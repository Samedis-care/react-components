let canImageCapture = null;
const getCanImageCapture = () => {
    if (canImageCapture != null)
        return canImageCapture;
    return (canImageCapture = (() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        if (input.capture === undefined)
            return false;
        input.capture = "environment";
        return input.capture === "environment";
    })());
};
export default getCanImageCapture;
