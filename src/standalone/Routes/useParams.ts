import useLocation from "./useLocation";
import { useContext } from "react";
import { RouteContext } from "./Route";
import matchPath from "./matchPath";

/**
 * Use route params
 */
const useParams = (): Record<string, string> => {
	const location = useLocation();
	const route = useContext(RouteContext);
	if (!route) return {};
	return matchPath({ path: route.path }, location.pathname)?.params ?? {};
};

export default useParams;
