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

/**
 * Properties for the Framework
 */
export interface IFrameworkProps {
	/**
	 * Disable the Material-UI Date Picker utils?
	 */
	disableMuiPickerUtils?: boolean;
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
 */
const ComponentsCareFramework = (props: ICompleteFrameworkProps) => (
	<Suspense fallback={loaderComponent}>
		<CCI18nProvider>
			<MuiPickerUtils disable={props.disableMuiPickerUtils}>
				<ThemeProvider defaultTheme={props.defaultTheme || getStandardTheme}>
					<QueryClientProvider client={ModelDataStore}>
						<PermissionContextProvider>
							<Router history={FrameworkHistory}>
								<DialogContextProvider>{props.children}</DialogContextProvider>
							</Router>
						</PermissionContextProvider>
					</QueryClientProvider>
				</ThemeProvider>
			</MuiPickerUtils>
		</CCI18nProvider>
	</Suspense>
);

export default React.memo(ComponentsCareFramework);
