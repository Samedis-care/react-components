import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsx(ThemeContext.Provider, { value: setNewTheme, children: _jsx(StyledEngineProvider, { injectFirst: true, children: _jsxs(MuiThemeProvider, { theme: theme, children: [_jsx(CssBaseline, {}), _jsx(_Fragment, { children: props.children })] }) }) }));
};
export default React.memo(ThemeProvider);
