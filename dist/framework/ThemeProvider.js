import React, { useCallback, useState } from "react";
import { createMuiTheme, MuiThemeProvider, CssBaseline, } from "@material-ui/core";
export var getStandardTheme = function (preferDark) { return ({
    palette: {
        type: preferDark ? "dark" : "light",
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
        return createMuiTheme(props.defaultTheme(matchMedia("(prefers-color-scheme: dark)").matches));
    }), theme = _a[0], setTheme = _a[1];
    var setNewTheme = useCallback(function (newTheme) {
        setTheme(createMuiTheme(newTheme));
    }, [setTheme]);
    return (React.createElement(ThemeContext.Provider, { value: setNewTheme },
        React.createElement(MuiThemeProvider, { theme: theme },
            React.createElement(CssBaseline, null),
            React.createElement(React.Fragment, null, props.children))));
};
export default React.memo(ThemeProvider);
