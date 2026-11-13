import { jsx as _jsx } from "react/jsx-runtime";
import Route from "../../standalone/Routes/Route";
/**
 * Makes the entries of a `RoutedTabPanelWrapper`
 * @returns `tab(name, element)`, which makes the entry that shows `element`
 * while the tab `name` is open
 */
const useRoutedTabPanel = () => {
    /**
     * @param name The `value` of the tab's `Tab`, `""` for the default tab
     * @param element The panel content, any element, e.g. `<SecurityPanel />`.
     * Not a `Route`: the entry already is the route `<name>/*`, so a Route
     * passed here would match only below it (`<name>/<its path>`) and the tab
     * would show nothing.
     * @returns The entry for RoutedTabPanelWrapper: a Route at `<name>/*`,
     * keyed by `name`
     */
    return function createTab(name, element) {
        return _jsx(Route, { path: `${name}/*`, element: element }, name);
    };
};
export default useRoutedTabPanel;
