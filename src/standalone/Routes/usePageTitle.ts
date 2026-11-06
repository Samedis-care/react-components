import { useContext } from "react";
import { RouteContext } from "./Route";
import { useRegisterPageTitle } from "./PageTitle";

/**
 * Names the current page in the document title while the calling component is
 * mounted, e.g. after a record once it has loaded. Use the Route's `title` prop
 * for a title that is known when the routes are declared.
 *
 * The title is more specific than the `title` of the Route that renders the
 * caller, and less specific than the titles of the routes nested inside it;
 * the most specific title names the page, and of equally specific ones the one
 * set last. HistoryRouter builds the document title from it, by default
 * "<title> – <app title>" (see `HistoryRouterProps.formatDocumentTitle`).
 * Outside a HistoryRouter it does nothing.
 * @param title The page title, already translated; null, undefined or "" set
 * none, e.g. while the record is loading
 */
const usePageTitle = (title: string | null | undefined): void => {
	const route = useContext(RouteContext);
	useRegisterPageTitle(title, route ? route.depth * 2 + 1 : -1);
};

export default usePageTitle;
