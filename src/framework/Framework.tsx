import React, { Suspense } from "react";
import { Loader } from "../standalone";
import { Router } from "react-router-dom";
import { DialogContextProvider, FrameworkHistory } from ".";
import ThemeProvider, {
	GetDefaultThemeCallback,
	getStandardTheme,
} from "./ThemeProvider";

/**
 * Properties for the Framework
 */
export interface IFrameworkProps {
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
 * - theme provider
 * - css baseline
 */
export default React.memo((props: ICompleteFrameworkProps) => (
	<Suspense fallback={loaderComponent}>
		<ThemeProvider defaultTheme={props.defaultTheme || getStandardTheme}>
			<Router history={FrameworkHistory}>
				<DialogContextProvider>{props.children}</DialogContextProvider>
			</Router>
		</ThemeProvider>
	</Suspense>
));
