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
import { withActions } from "@storybook/addon-actions";
import ccI18n, { langs } from "../src/i18n";

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

const LanguageSelector = () => {
	let langOptions: Record<string, string> = {};
	langs.forEach((lang) => (langOptions[lang] = lang));
	const lang = select(
		"Language",
		langOptions,
		localStorage.language || "en",
		"i18n"
	);

	useEffect(() => {
		localStorage.language = lang;
		ccI18n.changeLanguage(lang).catch(console.error);
	}, [lang]);

	return <></>;
};

export const decorators = [
	withKnobs,
	withActions,
	(Story: React.ComponentType, context: StoryContext) => {
		const [cng] = useState(() =>
			createGenerateClassName({
				seed: context.id,
			})
		);

		return (
			<Framework defaultTheme={loadTheme}>
				<ThemeSelector>
					<>
						<LanguageSelector />
						{process && process.env && process.env.JEST_WORKER_ID ? (
							<StylesProvider generateClassName={cng}>
								<Story />
							</StylesProvider>
						) : (
							<Story />
						)}
					</>
				</ThemeSelector>
			</Framework>
		);
	},
];

export const parameters = {
	knobs: {
		escapeHTML: false,
	},
};
