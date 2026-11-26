export { default as HistoryRouter } from "./HistoryRouter";
export { HistoryRouterContext, useHistoryRouterContext } from "./HistoryRouter";
export type {
	HistoryRouterProps,
	HistoryRouterContextType,
} from "./HistoryRouter";
export { default as matchPath } from "./matchPath";
export { normalizePath } from "./matchPath";
export type { PathPattern, PathMatch } from "./matchPath";
export { default as Route } from "./Route";
export { RouteContext, useRouteInfo } from "./Route";
export type { RouteProps, RouteContextType } from "./Route";
export { default as Routes } from "./Routes";
export type { RoutesProps } from "./Routes";
export { default as useLocation } from "./useLocation";
export { LocationContext } from "./useLocation";
export { default as useNavigate } from "./useNavigate";
export type { NavigateOptions, NavigateFunction } from "./useNavigate";
export { default as useParams } from "./useParams";
export { default as useResetScrollOnNavigation } from "./useResetScrollOnNavigation";
export { default as usePageTitle } from "./usePageTitle";
export type { DocumentTitleFormatter } from "./DocumentTitle";
export { default as Link } from "./Link";
export type { LinkProps } from "./Link";
// The types of the history package (v5) that the routing API is written in, so
// apps don't import "history" themselves. Action is the enum of
// `History.action` and `Update.action`, a value to compare them with.
export { Action } from "history";
export type { History, Location, Path, To, Transition, Update } from "history";
