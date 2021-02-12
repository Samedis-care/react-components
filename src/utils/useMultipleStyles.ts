import { ClassNameMap } from "@material-ui/styles/withStyles";

/**
 * Combine multiple useStyle hooks
 * @param props The properties to pass to the useStyle hooks
 * @param styles The useStyle hooks
 */
const useMultipleStyles = <
	// eslint-disable-next-line @typescript-eslint/ban-types
	Props extends object,
	ClassKey extends string = string
>(
	props: Props,
	...styles: (keyof Props extends never // `makeStyles` where the passed `styles` do not depend on props
		? (props?: unknown) => ClassNameMap<ClassKey> // `makeStyles` where the passed `styles` do depend on props
		: (props: Props) => ClassNameMap<ClassKey>)[]
): ClassNameMap<ClassKey> => {
	let classes: ClassNameMap<ClassKey> | undefined;
	styles.forEach((style) => {
		classes = style(classes ? { ...props, classes } : props);
	});
	if (!classes) throw new Error("No styles to apply!");
	return classes;
};

export default useMultipleStyles;
