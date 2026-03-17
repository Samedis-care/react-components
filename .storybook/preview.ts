import { createElement } from "react";
import type { Preview } from "@storybook/react-vite";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

const theme = createTheme();

const preview: Preview = {
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
