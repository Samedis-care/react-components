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
 */
const makeThemeStyles = <
	// eslint-disable-next-line @typescript-eslint/ban-types
	Props extends object,
	ClassKey extends string = string
>(
	getSubStyles: (
		theme: Theme
	) => Partial<Styles<Theme, Props, ClassKey>> | undefined,
	name: string
): keyof Props extends never // `makeStyles` where the passed `styles` do not depend on props
	? (props?: unknown) => ClassNameMap<ClassKey> // `makeStyles` where the passed `styles` do depend on props
	: (props: Props) => ClassNameMap<ClassKey> =>
	makeStyles(
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

export default makeThemeStyles;
