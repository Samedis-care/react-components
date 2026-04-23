import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { Suspense } from "react";
import Loader from "../standalone/Loader";
import DialogContextProvider from "./DialogContextProvider";
import { FrameworkHistory } from "./History";
import CCI18nProvider from "./CCI18nProvider";
import ThemeProvider, { getStandardTheme, } from "./ThemeProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import ModelDataStore from "../backend-integration/Store";
import MuiPickerUtils from "./MuiPickerUtils";
import PermissionContextProvider from "./PermissionContextProvider";
import MobileScalingFix from "../standalone/MobileScalingFix/MobileScalingFix";
import UnsafeToLeave from "./UnsafeToLeave";
import DragAndDropPrevention from "./DragAndDropPrevention";
import { StyledEngineProvider } from "@mui/material";
import HistoryRouter from "../standalone/Routes/HistoryRouter";
const loaderComponent = _jsx(Loader, {});
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
const ComponentsCareFramework = (props) => {
    return (_jsxs(Suspense, { fallback: loaderComponent, children: [!props.disableMobileScalingFix && (_jsx(MobileScalingFix, { ...props.mobileScalingFixProps })), !props.disableDragAndDropPrevention && _jsx(DragAndDropPrevention, {}), _jsx(CCI18nProvider, { disableHtmlLanguageAttributeSetter: props.disableHtmlLanguageAttributeSetter, children: _jsx(MuiPickerUtils, { disable: props.disableMuiPickerUtils, children: _jsx(StyledEngineProvider, { injectFirst: true, children: _jsx(ThemeProvider, { defaultTheme: props.defaultTheme || getStandardTheme, children: _jsx(QueryClientProvider, { client: ModelDataStore, children: _jsx(PermissionContextProvider, { children: _jsx(UnsafeToLeave, { disable: props.disableUnsafeToLeave, children: _jsx(HistoryRouter, { history: FrameworkHistory, children: _jsx(DialogContextProvider, { children: props.children }) }) }) }) }) }) }) }) })] }));
};
export default React.memo(ComponentsCareFramework);
