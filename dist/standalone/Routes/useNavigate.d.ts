import type { To } from "history";
export interface NavigateOptions {
    replace?: boolean;
    state?: unknown;
}
export interface NavigateFunction {
    (to: To, options?: NavigateOptions): void;
}
/**
 * Navigate using History API
 *
 * The target is a path of the app (or a location object): leading slashes
 * collapse into one, so `${useRouteInfo().url}/7` goes to "/7" also under a
 * route that matches at the root. A target with a scheme ("https://…",
 * "mailto:…", "javascript:…") throws an Error and nothing happens; leave the
 * app with `window.location` instead.
 */
declare const useNavigate: () => NavigateFunction;
export default useNavigate;
