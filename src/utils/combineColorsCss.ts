import combineColors from "./combineColors";

const combineColorsCss = (
	color1: Parameters<typeof combineColors>[0],
	color2: Parameters<typeof combineColors>[1],
): string => {
	return `rgba(${combineColors(color1, color2).join()})`;
};

export default combineColorsCss;
