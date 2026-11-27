import { History } from "history";
/**
 * The history the app routes with: Framework renders its `HistoryRouter` on
 * it, so inside Framework `Routes`, `Route`, `Link` (also the mark of its
 * `markCurrent`) and the routing hooks (`useLocation`, `useParams`) follow its
 * location, and `Link` and `useNavigate` navigate it. A `History` of the
 * history package (v5); by default a browser history
 * (`createBrowserHistory()`), created when this module loads. Replace it with
 * {@link setFrameworkHistory}.
 *
 * Use it from code outside of components: to navigate (`push`, `replace`,
 * `back`), or to follow the navigations with `listen`. Inside a component,
 * navigate with `useNavigate` and go back with
 * `useHistoryRouterContext().history.back()`.
 *
 * A navigation of it works as one through `Link` or `useNavigate`:
 * - A Form whose form page (e.g. BasicFormPage) guards its unsaved changes
 *   blocks a navigation that leaves them and asks "Leave form page?" first:
 *   once per navigation, however many forms inside Framework it leaves.
 * - A navigation to another pathname closes the dialogs pushed with
 *   `useDialogContext` (or a `show…Dialog` helper). Open dialogs don't block
 *   navigations.
 * - HistoryRouter scrolls the page to the top, or to the element its hash
 *   names, and keeps the focus with the new page, as it describes. Only
 *   `useNavigate` and `Link` can keep the scroll position
 *   (`preventScrollReset`).
 *
 * Unlike `useNavigate`, `push` and `replace` take the target as given (no
 * check that it is a path of the app), and they navigate the app's history
 * also from inside a HistoryRouter of its own (e.g. a wizard on a memory
 * history), where `useNavigate` navigates that router's history.
 *
 * Read it where it is used instead of keeping a copy: setFrameworkHistory
 * replaces it.
 */
export declare let FrameworkHistory: import("history").BrowserHistory;
/**
 * Replaces {@link FrameworkHistory}, the history the app routes with: e.g. a
 * `createMemoryHistory()` in tests and stories, or a history the app shares
 * with another library.
 *
 * Call it before Framework renders and before anything else uses
 * FrameworkHistory, e.g. at the top of the app's entry module, or in a test
 * before it renders Framework (a test may set a fresh history before each
 * Framework it mounts). Listeners and blockers added before stay on the
 * replaced history.
 *
 * A history set while Framework is mounted is not followed reliably:
 * Framework's router switches to it only when Framework renders again, and
 * the forms' leave guard blocks the history that is set when it starts to
 * block (the first form with unsaved changes). Until both have switched, they
 * work on different histories: `FrameworkHistory.push` may change no page,
 * and `Link` and `useNavigate` may leave unsaved changes without asking.
 * @param history The history to use, a `History` of the history package (v5)
 */
export declare const setFrameworkHistory: (history: History) => void;
