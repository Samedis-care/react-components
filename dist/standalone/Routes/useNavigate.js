import { useHistoryRouterContext } from "./HistoryRouter";
import { useCallback } from "react";
/**
 * Navigate using History API
 */
const useNavigate = () => {
    const { history } = useHistoryRouterContext();
    return useCallback((to, options) => {
        options ??= {};
        if (options.replace)
            history.replace(to, options.state);
        else
            history.push(to, options.state);
    }, [history]);
};
export default useNavigate;
