import { Styles } from "@mui/styles";
import makeStyles from "@mui/styles/makeStyles";
import {
	StyleRules,
	StyleRulesCallback,
} from "@mui/styles/withStyles/withStyles";
import { Theme } from "@mui/material";
import { ClassNameMap } from "@mui/styles/withStyles";
import combineClassMaps from "./combineClassMaps";

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
		const { classes: propClasses, ...otherProps } = props as Props & {
			classes?: Record<string, string>;
		};
		const themeClasses = useThemeStyles(otherProps as Props);
		return useParentStyles({
			...(props as Props),
			classes: combineClassMaps(themeClasses, propClasses),
		});
	};

	return useCombinedStyles as keyof Props extends never
		? (props?: unknown) => ClassNameMap<ClassKey>
		: (props: Props) => ClassNameMap<ClassKey>;
};

export default makeThemeStyles;
