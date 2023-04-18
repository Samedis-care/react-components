import { ClassNameMap } from "@mui/styles/withStyles";
/**
 * Filters the class names of a class map for warning-free usage
 * @param input The props with the class map
 * @param invert Invert the classes array (if true: remove all classes in classes, if false keep only classes in classes)
 * @param classes An array of (in)valid classes
 * @return The props with a cleaned class map
 */
declare const cleanClassMap: <ClassKeys extends string, Props extends {
    classes?: Partial<ClassNameMap<ClassKeys>> | undefined;
}>(input: Props, invert: boolean, ...classes: ClassKeys[]) => Props;
export default cleanClassMap;
