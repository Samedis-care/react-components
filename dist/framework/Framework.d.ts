import React from "react";
import { GetDefaultThemeCallback } from "./ThemeProvider";
import { MobileScalingFixProps } from "../standalone/MobileScalingFix/MobileScalingFix";
import type { DocumentTitleFormatter } from "../standalone/Routes/DocumentTitle";
/**
 * Properties for the Framework
 */
export interface IFrameworkProps {
    /**
     * Disable the Material-UI Date Picker utils?
     */
    disableMuiPickerUtils?: boolean;
    /**
     * Disable drag and drop prevention (used to prevent page unloads when dropping files)
     */
    disableDragAndDropPrevention?: boolean;
    /**
     * Disable setting of HTML tag language attribute
     */
    disableHtmlLanguageAttributeSetter?: boolean;
    /**
     * Disable mobile scaling fix
     */
    disableMobileScalingFix?: boolean;
    /**
     * Mobile scaling fix props
     */
    mobileScalingFixProps?: MobileScalingFixProps;
    /**
     * Disable unsafe-to-leave handling (window.beforeunload callback)
     */
    disableUnsafeToLeave?: boolean;
    /**
     * Builds the document title from the page titles that `PageTitle` headings
     * and `usePageTitle` set (see `HistoryRouterProps.formatDocumentTitle`).
     * Default: "<most specific page title> – <app title>", where the app title
     * is the document's title when the Framework mounted.
     */
    formatDocumentTitle?: DocumentTitleFormatter;
    /**
     * The children which have access to the framework's capabilities (usually your whole app)
     */
    children: React.ReactNode;
}
export interface IFrameworkThemeProps {
    /**
     * Can be used to supply a default theme
     */
    defaultTheme?: GetDefaultThemeCallback;
}
type ICompleteFrameworkProps = IFrameworkProps & IFrameworkThemeProps;
declare const _default: React.MemoExoticComponent<(props: ICompleteFrameworkProps) => React.JSX.Element>;
export default _default;
