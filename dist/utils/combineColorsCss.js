import combineColors from "./combineColors";
const combineColorsCss = (color1, color2) => {
    return `rgba(${combineColors(color1, color2).join()})`;
};
export default combineColorsCss;
