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
};

const customPalette = {
	primary: {
		main: "rgb(8, 105, 179)",
		light: "rgb(57, 135, 194)",
	},
	secondary: {
		main: "rgb(185, 215, 240)",
	},
	action: {
		hover: "rgba(0,0,0, .2)",
	},
	error: {
		main: "rgb(255, 99, 71)",
		contrastText: "#CCC",
	},
};
/* example for a customized theme per client requirements */
const getCustomTheme = (): ThemeOptions => ({
	spacing: [0, 5, 7, 10, 15, 21, 25],
	palette: {
		type: "dark",
		...customPalette,
	},
	componentsCare: {
		uiKit: {
			label: {},
			input: {
				placeholder: {
					important: {
						color: customPalette.error.main,
					},
				},
			},
			actionButton: {
				padding: "7px 25px",
				border: "none",
				borderRadius: 25,
				fontSize: "0.75rem",
				/* example */
				style: {
					border: "1px solid rgba(0,0,0, .15)",
					boxShadow: "rgba(0, 0, 0, 0.25) 0px 0px 5px 0px",
				},
				disabled: {
					backgroundColor: "#bcbdbf",
					style: {
						boxShadow: "rgba(255, 255, 255, 0.25) 0px 0px 2px 0px",
					},
				},
			},
			formButtons: {
				buttonWrapper: {
					margin: "0 5px 0 0",
				},
				container: {
					float: "left",
					width: "auto",
					border: "none",
					borderRadius: "32px",
					padding: "20px",
					margin: "20px",
					backgroundColor: customPalette.secondary.main,
					backgroundColorOpacity: 0.7,
					/* example */
					style: {
						background:
							"linear-gradient(345deg, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%)",
						boxShadow: "0 0 10px 0 rgba(0,0,0, .35)",
					},
				},
			},
			selector: {
				inputRoot: {
					'&[class*="MuiOutlinedInput-root"]': {
						paddingTop: 0,
						paddingBottom: 0,
					},
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
