import React, { Suspense } from "react";
import { Loader } from "../index";
import { Router } from "react-router-dom";
import { createBrowserHistory } from "history";

/**
 * Properties for the Framework
 */
export interface IFrameworkProps {
	/**
	 * The children which have access to the framework's capabilities (usually your whole app)
	 */
	children: React.ReactNode;
}

/**
 * The History used by the react-router instance provided by the framework
 * Can be used to navigate programmatically
 */
export const FrameworkHistory = createBrowserHistory();

/**
 * Provides:
 * - react-router Instance
 */
export default (props: IFrameworkProps) => (
	<Suspense fallback={<Loader />}>
		<Router history={FrameworkHistory}>{props.children}</Router>
	</Suspense>
);
