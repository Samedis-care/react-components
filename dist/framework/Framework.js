import React, { Suspense } from "react";
import { Loader } from "../standalone";
import { unstable_HistoryRouter as HistoryRouter } from "react-router-dom";
import { DialogContextProvider, FrameworkHistory, CCI18nProvider } from ".";
import ThemeProvider, { getStandardTheme, } from "./ThemeProvider";
import { QueryClientProvider } from "react-query";
import { ModelDataStore } from "../backend-integration";
import MuiPickerUtils from "./MuiPickerUtils";
import PermissionContextProvider from "./PermissionContextProvider";
import MobileScalingFix from "../standalone/MobileScalingFix/MobileScalingFix";
import UnsafeToLeave from "./UnsafeToLeave";
import DragAndDropPrevention from "./DragAndDropPrevention";
import { StyledEngineProvider } from "@mui/material";
var loaderComponent = React.createElement(Loader, null);
/**
 * Provides:
 * - react-router instance
 * - dialog context
 * - i18n context (for components-care)
 * - react-query cache
 * - theme provider
 * - css baseline
 * - permission context
 * - material-ui date picker utils (optional, enabled by default, locale managed by i18n)
 * - html language attribute setting based on locale (optional, enabled by default)
 * - mobile scaling fix (optional, enabled by default)
 * - drag & drop default prevention (prevents unloading page)
 */
var ComponentsCareFramework = function (props) {
    return (React.createElement(Suspense, { fallback: loaderComponent },
        !props.disableMobileScalingFix && React.createElement(MobileScalingFix, null),
        !props.disableDragAndDropPrevention && React.createElement(DragAndDropPrevention, null),
        React.createElement(CCI18nProvider, { disableHtmlLanguageAttributeSetter: props.disableHtmlLanguageAttributeSetter },
            React.createElement(MuiPickerUtils, { disable: props.disableMuiPickerUtils },
                React.createElement(StyledEngineProvider, { injectFirst: true },
                    React.createElement(ThemeProvider, { defaultTheme: props.defaultTheme || getStandardTheme },
                        React.createElement(QueryClientProvider, { client: ModelDataStore },
                            React.createElement(PermissionContextProvider, null,
                                React.createElement(UnsafeToLeave, { disable: props.disableUnsafeToLeave },
                                    React.createElement(HistoryRouter, { history: FrameworkHistory },
                                        React.createElement(DialogContextProvider, null, props.children)))))))))));
};
export default React.memo(ComponentsCareFramework);
