import { ClassNameMap } from "@mui/styles/withStyles";
/**
 * Combine multiple useStyle hooks
 * @param props The properties to pass to the useStyle hooks
 * @param styles The useStyle hooks
 */
declare const useMultipleStyles: <Props extends object, ClassKey extends string = string>(props: Props, ...styles: (keyof Props extends never ? (props?: unknown) => ClassNameMap<ClassKey> : (props: Props) => ClassNameMap<ClassKey>)[]) => ClassNameMap<ClassKey>;
export default useMultipleStyles;
