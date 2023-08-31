import React, { useCallback, useState } from "react";
import { createTheme, ThemeProvider as MuiThemeProvider, StyledEngineProvider, CssBaseline, } from "@mui/material";
export const getStandardTheme = (preferDark) => ({
    palette: {
        mode: preferDark ? "dark" : "light",
    },
});
/**
 * Context for the dialog state
 */
export const ThemeContext = React.createContext(undefined);
/**
 * Provides the application with an state to manage theming
 */
const ThemeProvider = (props) => {
    const [theme, setTheme] = useState(() => createTheme(props.defaultTheme(matchMedia("(prefers-color-scheme: dark)").matches)));
    const setNewTheme = useCallback((newTheme) => {
        setTheme(createTheme(newTheme));
    }, [setTheme]);
    return (React.createElement(ThemeContext.Provider, { value: setNewTheme },
        React.createElement(StyledEngineProvider, { injectFirst: true },
            React.createElement(MuiThemeProvider, { theme: theme },
                React.createElement(CssBaseline, null),
                React.createElement(React.Fragment, null, props.children)))));
};
export default React.memo(ThemeProvider);
