import { jsx as _jsx } from "react/jsx-runtime";
import Route from "../../standalone/Routes/Route";
const useRoutedTabPanel = () => {
    return function createTab(name, children) {
        return _jsx(Route, { path: `${name}/*`, element: children }, name);
    };
};
export default useRoutedTabPanel;
