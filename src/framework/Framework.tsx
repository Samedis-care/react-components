import React, { Suspense } from "react";
import Loader from "../standalone/Loader";
import DialogContextProvider from "./DialogContextProvider";
import { FrameworkHistory } from "./History";
import CCI18nProvider from "./CCI18nProvider";
import ThemeProvider, {
	GetDefaultThemeCallback,
	getStandardTheme,
} from "./ThemeProvider";
import { QueryClientProvider } from "react-query";
import ModelDataStore from "../backend-integration/Store";
import MuiPickerUtils from "./MuiPickerUtils";
import PermissionContextProvider from "./PermissionContextProvider";
import MobileScalingFix, {
	MobileScalingFixProps,
} from "../standalone/MobileScalingFix/MobileScalingFix";
import UnsafeToLeave from "./UnsafeToLeave";
import DragAndDropPrevention from "./DragAndDropPrevention";
import { StyledEngineProvider } from "@mui/material";
import HistoryRouter from "../standalone/Routes/HistoryRouter";

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

const loaderComponent = <Loader />;

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
const ComponentsCareFramework = (props: ICompleteFrameworkProps) => {
	return (
		<Suspense fallback={loaderComponent}>
			{!props.disableMobileScalingFix && (
				<MobileScalingFix {...props.mobileScalingFixProps} />
			)}
			{!props.disableDragAndDropPrevention && <DragAndDropPrevention />}
			<CCI18nProvider
				disableHtmlLanguageAttributeSetter={
					props.disableHtmlLanguageAttributeSetter
				}
			>
				<MuiPickerUtils disable={props.disableMuiPickerUtils}>
					<StyledEngineProvider injectFirst>
						<ThemeProvider
							defaultTheme={props.defaultTheme || getStandardTheme}
						>
							<QueryClientProvider client={ModelDataStore}>
								<PermissionContextProvider>
									<UnsafeToLeave disable={props.disableUnsafeToLeave}>
										<HistoryRouter history={FrameworkHistory}>
											<DialogContextProvider>
												{props.children}
											</DialogContextProvider>
										</HistoryRouter>
									</UnsafeToLeave>
								</PermissionContextProvider>
							</QueryClientProvider>
						</ThemeProvider>
					</StyledEngineProvider>
				</MuiPickerUtils>
			</CCI18nProvider>
		</Suspense>
	);
};

export default React.memo(ComponentsCareFramework);
