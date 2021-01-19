import React, { useContext, useEffect, useState } from "react";
import { Framework, ThemeContext } from "../src";
import {
	createGenerateClassName,
	StylesProvider,
	ThemeOptions,
	useTheme,
} from "@material-ui/core";
import { Rule, StyleSheet } from "jss";
import { StoryContext } from "@storybook/addons";
import { button, color, select, withKnobs } from "@storybook/addon-knobs";

// so jest won't complain about mismatching numbers anymore
const classIds: Record<string, number> = {};
const getClassId = (name: string | undefined): number => {
	const filledName = name === undefined ? "undefined-displayName" : name;

	if (!(filledName in classIds)) {
		classIds[filledName] = 0;
	} else {
		classIds[filledName]++;
	}
	return classIds[filledName];
};

const CssClassNameGenerator = (storyName: string | undefined) => (
	rule: Rule,
	sheet?: StyleSheet<string>
) => `${sheet?.options?.classNamePrefix}-${rule.key}-${getClassId(storyName)}`;

const getDefaultTheme = (): ThemeOptions => ({
	palette: {
		type: "light",
	},
});

/* re-usable colors for our theme */
const customColors = {
	white: "rgb(255, 255, 255)",
	primary: {
		main: "rgb(8, 105, 179)",
		light: "rgb(57, 135, 194)"
	},
	secondary: {
		main: "rgb(185, 215, 240)",
	},
};
/* example for a customized theme per client requirements */
const getCustomTheme = (): ThemeOptions => ({
	palette: {
		type: "light",
		primary: {
			main: customColors.primary.main,
			light: customColors.primary.light,
		},
		secondary: {
			main: customColors.secondary.main,
		},
	},
	componentsCare: {
		portal: {
			header: {
				height: 40,
				backgroundColor: customColors.secondary.main,
			},
			menu: {
				width: "600px",
				widthCollapsed: "50px",
				padding: "0 35px 0 0",
				color: customColors.white,
				backgroundColor: customColors.primary.main,
				selected: {
					borderRadius: "0 50px 50px 0",
					backgroundColor: customColors.primary.light,
				}
			}
		},
	},
});

const loadTheme = (): ThemeOptions => {
	const themeStr = localStorage.getItem("theme");
	if (!themeStr) return getDefaultTheme();
	return JSON.parse(themeStr) as ThemeOptions;
};

interface ThemeSelectorProps {
	children: React.ReactElement;
}

const ThemeSelector = (props: ThemeSelectorProps) => {
	const theme = useTheme();
	const setTheme = useContext(ThemeContext)!;

	const type = select(
		"Theme Type",
		{
			Dark: "dark",
			Light: "light",
		},
		theme.palette.type,
		"Theme"
	);
	const primary = color(
		"Theme Primary color",
		theme.palette.primary.main,
		"Theme"
	);
	const secondary = color(
		"Theme Secondary color",
		theme.palette.secondary.main,
		"Theme"
	);

	button(
		"Reset",
		() => {
			const theme = getDefaultTheme();
			localStorage.setItem("theme", JSON.stringify(theme));
			setTheme(theme);
		},
		"Theme"
	);

	button(
		"Set Custom",
		() => {
			const theme = getCustomTheme();
			localStorage.setItem("theme", JSON.stringify(theme));
			setTheme(theme);
		},
		"Theme"
	);

	useEffect(() => {
		const theme = {
			palette: {
				primary: {
					main: primary,
				},
				secondary: {
					main: secondary,
				},
				type,
			},
		};

		localStorage.setItem("theme", JSON.stringify(theme));
		setTheme(theme);
	}, [type, primary, secondary]);

	return props.children;
};

export const decorators = [
	withKnobs,
	(Story: React.ComponentType, context: StoryContext) => {
		const [cng] = useState(() =>
			createGenerateClassName({
				seed: context.id,
			})
		);

		return (
			<Framework defaultTheme={loadTheme}>
				<ThemeSelector>
					<StylesProvider generateClassName={cng}>
						<Story />
					</StylesProvider>
				</ThemeSelector>
			</Framework>
		);
	},
];
