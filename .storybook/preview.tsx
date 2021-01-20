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
		uiKit: {
			actionButton: {
				padding: "7px 25px",
				border: "none",
				fontSize: "0.75rem",
				disabled: {
					backgroundColor: "#bcbdbf",
				},
			},
			formButtons: {
				buttonWrapper: {
					margin: "0 1rem 0 0",
				},
				container: {
					float: "left",
					width: "auto",
					border: "none",
					borderRadius: "32px",
					padding: "20px",
					margin: "20px",
					backgroundColor: customColors.secondary.main,
					backgroundColorOpacity: .7, 
				},
			},
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

const AdvThemeSelector = (props: ThemeSelectorProps) => {
	const setTheme = useContext(ThemeContext)!;

	const theme = getCustomTheme();
	localStorage.setItem("theme", JSON.stringify(theme));
	setTheme(theme);

	const themeJson = text(
		"Theme",
		JSON.stringify(theme, undefined, 4),
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
