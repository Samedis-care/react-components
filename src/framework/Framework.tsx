import React, { Suspense } from "react";
import { Loader } from "../standalone";
import { Router } from "react-router-dom";
import { DialogContextProvider, FrameworkHistory } from ".";
import ThemeProvider, {
	GetDefaultThemeCallback,
	getStandardTheme,
} from "./ThemeProvider";
import { ReactQueryCacheProvider } from "react-query";
import { ModelDataStore } from "../backend-integration";
import MuiPickerUtils from "./MuiPickerUtils";

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
 * - react-query cache
 * - theme provider
 * - css baseline
 * - material-ui date picker utils (optional, enabled by default, locale managed by i18n)
 */
const ComponentsCareFramework = (props: ICompleteFrameworkProps) => (
	<Suspense fallback={loaderComponent}>
		<MuiPickerUtils disable={props.disableMuiPickerUtils}>
			<ThemeProvider defaultTheme={props.defaultTheme || getStandardTheme}>
				<ReactQueryCacheProvider queryCache={ModelDataStore}>
					<Router history={FrameworkHistory}>
						<DialogContextProvider>{props.children}</DialogContextProvider>
					</Router>
				</ReactQueryCacheProvider>
			</ThemeProvider>
		</MuiPickerUtils>
	</Suspense>
);

export default React.memo(ComponentsCareFramework);
