import { useHistoryRouterContext } from "./HistoryRouter";
import { useCallback } from "react";
/**
 * Navigate using History API
 */
const useNavigate = () => {
    const { history } = useHistoryRouterContext();
    return useCallback((to, options) => {
        // reset scroll position - resetting all elements would break DataGrid scroll state restore
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.documentElement.scrollLeft = 0;
        document.body.scrollTop = 0;
        document.body.scrollLeft = 0;
        options ??= {};
        if (options.replace)
            history.replace(to, options.state);
        else
            history.push(to, options.state);
    }, [history]);
};
export default useNavigate;
