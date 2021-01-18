import React, { useContext, useEffect, useState } from "react";
import { Framework, ThemeContext } from "../src";
import {
	createGenerateClassName,
	StylesProvider,
	ThemeOptions,
	useTheme,
} from "@material-ui/core";
import { StoryContext } from "@storybook/addons";
import { button, color, select, text, withKnobs } from "@storybook/addon-knobs";
import { withActions } from "@storybook/addon-actions";
import ccI18n, { langs } from "../src/i18n";

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

const AdvThemeSelector = (props: ThemeSelectorProps) => {
	const setTheme = useContext(ThemeContext)!;

	const themeJson = text(
		"Theme",
		JSON.stringify(loadTheme(), undefined, 4),
		"Theme (Advanced)"
	);

	useEffect(() => {
		try {
			const theme = JSON.parse(themeJson);

			localStorage.setItem("theme", JSON.stringify(theme));
			setTheme(theme);
		} catch (e) {
			console.warn("Theme JSON invalid!", e);
		}
	}, [themeJson]);

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
					<AdvThemeSelector>
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
					</AdvThemeSelector>
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
