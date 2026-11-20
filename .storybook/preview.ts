/// <reference types="vite/client" />
import { createElement } from "react";
import type { Preview } from "@storybook/react-vite";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
// MUI's theme asks for Roboto and the apps bundle it the same way; without it, stories
// render in whatever fonts the machine has (a monospace font on a bare Linux).
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

const theme = createTheme();

// A font face loads only once text uses it. Loading it before the first render keeps layout
// assertions and screenshots from measuring the fallback font.
const loadFonts = async () => {
	await Promise.all(
		[300, 400, 500, 700].map((weight) =>
			document.fonts.load(`${weight} 1em Roboto`),
		),
	);
};

const preview: Preview = {
	loaders: [loadFonts],
	decorators: [
		(Story) =>
			createElement(
				ThemeProvider,
				{ theme },
				createElement(CssBaseline),
				createElement(Story),
			),
	],
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		a11y: {
			test: "todo",
		},
	},
};

export default preview;
