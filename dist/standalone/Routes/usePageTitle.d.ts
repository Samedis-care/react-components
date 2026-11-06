/**
 * Names the current page in the document title (browser tab, history, what a
 * screen reader announces for the window) while the calling component is
 * mounted. For pages without a visible heading; a page with one renders it as
 * `PageTitle`, which calls this hook with the heading's text.
 *
 * The title set in the deepest route names the page, e.g. a record form's
 * routed below its list; of titles in the same route, the one set last.
 * HistoryRouter builds the document title from it, by default
 * "<title> – <app title>" (see `HistoryRouterProps.formatDocumentTitle`).
 * Outside a HistoryRouter it does nothing.
 * @param title The page title, already translated; null, undefined or "" set
 * none, e.g. while the record is loading
 */
declare const usePageTitle: (title: string | null | undefined) => void;
export default usePageTitle;
