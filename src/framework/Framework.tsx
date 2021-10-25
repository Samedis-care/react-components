import React, { Suspense } from "react";
import { Loader } from "../standalone";
import { Router } from "react-router-dom";
import { DialogContextProvider, FrameworkHistory, CCI18nProvider } from ".";
import ThemeProvider, {
	GetDefaultThemeCallback,
	getStandardTheme,
} from "./ThemeProvider";
import { QueryClientProvider } from "react-query";
import { ModelDataStore } from "../backend-integration";
import MuiPickerUtils from "./MuiPickerUtils";
import PermissionContextProvider from "./PermissionContextProvider";
import MobileScalingFix from "../standalone/MobileScalingFix/MobileScalingFix";
import UnsafeToLeave from "./UnsafeToLeave";

/**
 * Properties for the Framework
 */
export interface IFrameworkProps {
	/**
	 * Disable the Material-UI Date Picker utils?
	 */
	disableMuiPickerUtils?: boolean;
	/**
	 * Disable setting of HTML tag language attribute
	 */
	disableHtmlLanguageAttributeSetter?: boolean;
	/**
	 * Disable mobile scaling fix
	 */
	disableMobileScalingFix?: boolean;
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
 */
const ComponentsCareFramework = (props: ICompleteFrameworkProps) => {
	return (
		<Suspense fallback={loaderComponent}>
			{!props.disableMobileScalingFix && <MobileScalingFix />}
			<CCI18nProvider
				disableHtmlLanguageAttributeSetter={
					props.disableHtmlLanguageAttributeSetter
				}
			>
				<MuiPickerUtils disable={props.disableMuiPickerUtils}>
					<ThemeProvider defaultTheme={props.defaultTheme || getStandardTheme}>
						<QueryClientProvider client={ModelDataStore}>
							<PermissionContextProvider>
								<UnsafeToLeave disable={props.disableUnsafeToLeave}>
									<Router history={FrameworkHistory}>
										<DialogContextProvider>
											{props.children}
										</DialogContextProvider>
									</Router>
								</UnsafeToLeave>
							</PermissionContextProvider>
						</QueryClientProvider>
					</ThemeProvider>
				</MuiPickerUtils>
			</CCI18nProvider>
		</Suspense>
	);
};

export default React.memo(ComponentsCareFramework);
