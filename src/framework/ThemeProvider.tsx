import React, { useCallback, useState } from "react";
import type { IFrameworkProps } from "./Framework";
import {
	createTheme,
	Theme,
	ThemeProvider as MuiThemeProvider,
	StyledEngineProvider,
	CssBaseline,
	ThemeOptions,
} from "@mui/material";

export type SetThemeAction = (theme: ThemeOptions) => void;
export type GetDefaultThemeCallback = (preferDark: boolean) => ThemeOptions;

export const getStandardTheme: GetDefaultThemeCallback = (
	preferDark: boolean,
): ThemeOptions => ({
	palette: {
		mode: preferDark ? "dark" : "light",
	},
});

export interface IThemeProviderProps extends IFrameworkProps {
	/**
	 * Provides the default Theme
	 */
	defaultTheme: GetDefaultThemeCallback;
}

/**
 * Context for the dialog state
 */
export const ThemeContext = React.createContext<SetThemeAction | undefined>(
	undefined,
);

/**
 * Provides the application with an state to manage theming
 */
const ThemeProvider = (props: IThemeProviderProps) => {
	const [theme, setTheme] = useState<Theme>(() =>
		createTheme(
			props.defaultTheme(matchMedia("(prefers-color-scheme: dark)").matches),
		),
	);
	const setNewTheme = useCallback<SetThemeAction>(
		(newTheme: ThemeOptions) => {
			setTheme(createTheme(newTheme));
		},
		[setTheme],
	);

	return (
		<ThemeContext.Provider value={setNewTheme}>
			<StyledEngineProvider injectFirst>
				<MuiThemeProvider theme={theme}>
					<CssBaseline />
					<>{props.children}</>
				</MuiThemeProvider>
			</StyledEngineProvider>
		</ThemeContext.Provider>
	);
};

export default React.memo(ThemeProvider);
