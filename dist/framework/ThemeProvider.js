import React, { useCallback, useState } from "react";
import { createTheme, ThemeProvider as MuiThemeProvider, StyledEngineProvider, CssBaseline, } from "@mui/material";
export var getStandardTheme = function (preferDark) { return ({
    palette: {
        mode: preferDark ? "dark" : "light",
    },
}); };
/**
 * Context for the dialog state
 */
export var ThemeContext = React.createContext(undefined);
/**
 * Provides the application with an state to manage theming
 */
var ThemeProvider = function (props) {
    var _a = useState(function () {
        return createTheme(props.defaultTheme(matchMedia("(prefers-color-scheme: dark)").matches));
    }), theme = _a[0], setTheme = _a[1];
    var setNewTheme = useCallback(function (newTheme) {
        setTheme(createTheme(newTheme));
    }, [setTheme]);
    return (React.createElement(ThemeContext.Provider, { value: setNewTheme },
        React.createElement(StyledEngineProvider, { injectFirst: true },
            React.createElement(MuiThemeProvider, { theme: theme },
                React.createElement(CssBaseline, null),
                React.createElement(React.Fragment, null, props.children)))));
};
export default React.memo(ThemeProvider);
