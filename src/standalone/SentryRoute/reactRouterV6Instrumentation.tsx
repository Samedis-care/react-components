// Modified from https://github.com/getsentry/sentry-javascript/blob/master/packages/react/src/reactrouterv6.tsx

import { Transaction, TransactionContext } from "@sentry/types";
import { getGlobalObject } from "@sentry/utils";
import hoistNonReactStatics from "hoist-non-react-statics";
import React, {
	Dispatch,
	SetStateAction,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { Location } from "@sentry/react/types/types";
import {
	matchRoutes,
	useLocation,
	createRoutesFromChildren,
	useNavigationType,
} from "react-router-dom";

interface RouteObject {
	caseSensitive?: boolean;
	children?: RouteObject[];
	element?: React.ReactNode;
	index?: boolean;
	path?: string;
}

let activeTransaction: Transaction | undefined;

let _customStartTransaction: (
	context: TransactionContext
) => Transaction | undefined;
let _startTransactionOnLocationChange: boolean;

const global = getGlobalObject<Window>();

const SENTRY_TAGS = {
	"routing.instrumentation": "react-router-v6-components-care",
};

function getInitPathName(): string | undefined {
	if (global && global.location) {
		return global.location.pathname;
	}

	return undefined;
}

export function reactRouterV6Instrumentation() {
	return (
		customStartTransaction: (
			context: TransactionContext
		) => Transaction | undefined,
		startTransactionOnPageLoad = true,
		startTransactionOnLocationChange = true
	): void => {
		const initPathName = getInitPathName();
		if (startTransactionOnPageLoad && initPathName) {
			activeTransaction = customStartTransaction({
				name: initPathName,
				op: "pageload",
				tags: SENTRY_TAGS,
			});
		}

		_customStartTransaction = customStartTransaction;
		_startTransactionOnLocationChange = startTransactionOnLocationChange;
	};
}

const getTransactionName = (
	routes: RouteObject[],
	location: Location
): string => {
	if (!routes || routes.length === 0) {
		return location.pathname;
	}

	const branches = matchRoutes(routes, location);

	if (branches) {
		// eslint-disable-next-line @typescript-eslint/prefer-for-of
		for (let x = 0; x < branches.length; x++) {
			if (
				branches[x].route &&
				branches[x].route.path &&
				branches[x].pathname === location.pathname
			) {
				const ret = branches[x].route.path || location.pathname;
				if (ret.endsWith("/*")) return ret.slice(0, -1);
				return ret;
			}
		}
	}

	return location.pathname;
};

// to provide full route paths
interface SentryRouteContextType {
	route: RouteObject | null | undefined;
}
const SentryRouteContext = React.createContext<SentryRouteContextType | null>(
	null
);
// tracing, has all routes so it can listen to navigation events
interface SentryRouteTracingContextType {
	setRoutes: Dispatch<SetStateAction<RouteObject[]>>;
}
const SentryRouteTracingContext = React.createContext<SentryRouteTracingContextType | null>(
	null
);
const useSentryRouteTracingContext = () => {
	const ctx = useContext(SentryRouteTracingContext);
	if (!ctx) throw new Error("missing SentryRouteTracingContext");
	return ctx;
};
export interface SentryRoutesTracingProps {
	children: NonNullable<React.ReactElement>;
}
export const SentryRoutesTracing = (props: SentryRoutesTracingProps) => {
	const [routes, setRoutes] = useState<RouteObject[]>([]);
	const location = useLocation();
	const navigationType = useNavigationType();
	const initialTx = useRef(true);

	const ctx = useMemo(
		(): SentryRouteTracingContextType => ({
			setRoutes,
		}),
		[]
	);

	const routesSorted = useMemo(
		() => routes.sort((a, b) => (b.path?.length ?? 0) - (a.path?.length ?? 0)),
		[routes]
	);

	const txName = useMemo(() => getTransactionName(routesSorted, location), [
		location,
		routesSorted,
	]);

	useEffect(() => {
		if (activeTransaction) activeTransaction.setName(txName);
	}, [txName]);

	useEffect(() => {
		// don't finish first transaction
		if (initialTx.current) {
			initialTx.current = false;
			return;
		}
		if (
			_startTransactionOnLocationChange &&
			(navigationType === "PUSH" || navigationType === "POP")
		) {
			if (activeTransaction) {
				activeTransaction.finish();
			}
			activeTransaction = _customStartTransaction({
				name: txName,
				op: "navigation",
				tags: SENTRY_TAGS,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location]);

	return (
		<SentryRouteTracingContext.Provider value={ctx}>
			{props.children}
		</SentryRouteTracingContext.Provider>
	);
};

export function withSentryReactRouterV6Routing<
	P extends Record<string, unknown>,
	R extends React.FC<P>
>(Routes: R): R {
	if (!_customStartTransaction) {
		throw new Error(
			"reactRouterV6Instrumentation was unable to wrap Routes because of one or more missing parameters."
		);
	}

	const SentryRoutes: React.FC<P> = (props: P) => {
		const location = useLocation();
		const routeContext = useContext(SentryRouteContext);
		const traceContext = useSentryRouteTracingContext();
		const [routes, setRoutes] = useState<RouteObject[]>([]);

		useEffect(() => {
			// Performance concern:
			// This is repeated when <Routes /> is rendered.
			let childRoutes = createRoutesFromChildren(
				props.children as JSX.Element[]
			);
			if (routeContext) {
				if (!routeContext.route)
					throw new Error(
						"child rendered, but parent does not have route match"
					);
				let basePath: string = routeContext.route.path ?? "";
				if (basePath) {
					if (basePath.endsWith("/*")) basePath = basePath.slice(0, -1);
					childRoutes = childRoutes.map((route) => {
						if (route.path == null) return route;
						const pathFull = (route.path.startsWith("/")
							? `${basePath}${route.path}`
							: `${basePath}/${route.path}`
						).replace("//", "/");
						return {
							...route,
							path: pathFull,
						};
					});
				}
			}
			setRoutes(childRoutes);
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [props.children, routeContext]);

		// register routes with tracing
		useEffect(() => {
			traceContext.setRoutes((prev) => [...prev, ...routes]);
			return () => {
				traceContext.setRoutes((prev) =>
					prev.filter((entry) => !routes.includes(entry))
				);
			};
		}, [routes, traceContext]);

		const routeCtx = useMemo(() => {
			const matches = matchRoutes(routes, location);
			const match = matches && matches[0];
			return {
				route: match?.route,
			};
		}, [routes, location]);

		if (routes.length === 0) return <></>; // no routes, no content

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore Setting more specific React Component typing for `R` generic above
		// will break advanced type inference done by react router params
		const routesElem = <Routes {...props} />;

		return (
			<SentryRouteContext.Provider value={routeCtx}>
				{routesElem}
			</SentryRouteContext.Provider>
		);
	};

	hoistNonReactStatics(SentryRoutes, Routes);

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore Setting more specific React Component typing for `R` generic above
	// will break advanced type inference done by react router params
	return SentryRoutes;
}
