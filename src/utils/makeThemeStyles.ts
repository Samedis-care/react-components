import { makeStyles } from "@material-ui/core/styles";
import {
	StyleRules,
	StyleRulesCallback,
} from "@material-ui/styles/withStyles/withStyles";
import { Theme } from "@material-ui/core";
import { Styles } from "@material-ui/core/styles/withStyles";
import { ClassNameMap } from "@material-ui/styles/withStyles";

/**
 * Calls makeStyles based on values from theme
 * @param getSubStyles A function to extract the values from the theme which should be used in makeStyles
 * @param name The name for the styles
 * @param useParentStyles The parent styles to override with theme styles
 */
const makeThemeStyles = <
	// eslint-disable-next-line @typescript-eslint/ban-types
	Props extends object,
	ClassKey extends string = string
>(
	getSubStyles: (
		theme: Theme
	) => Partial<Styles<Theme, Props, ClassKey>> | undefined,
	name: string,
	useParentStyles?: ReturnType<typeof makeStyles>
): keyof Props extends never // `makeStyles` where the passed `styles` do not depend on props
	? (props?: unknown) => ClassNameMap<ClassKey> // `makeStyles` where the passed `styles` do depend on props
	: (props: Props) => ClassNameMap<ClassKey> => {
	const useThemeStyles = makeStyles(
		(theme) => {
			const styleProvider = getSubStyles(theme) ?? {};
			if (typeof styleProvider === "function") {
				return (styleProvider as StyleRulesCallback<Theme, Props, ClassKey>)(
					theme
				);
			} else {
				return styleProvider as StyleRules<Props, ClassKey>;
			}
		},
		{ name: name + "-ThemeStyles" }
	);

	if (!useParentStyles) {
		return useThemeStyles;
	}

	const useCombinedStyles = (
		props?: keyof Props extends never ? unknown : Props
	): ClassNameMap<ClassKey> => {
		const themeClasses = useThemeStyles(props as Props); // inherit from component props classes
		return useParentStyles({
			...(props as Props),
			classes: themeClasses, // inherit from themeClasses
		});
	};

	return useCombinedStyles as keyof Props extends never
		? (props?: unknown) => ClassNameMap<ClassKey>
		: (props: Props) => ClassNameMap<ClassKey>;
};

export default makeThemeStyles;
