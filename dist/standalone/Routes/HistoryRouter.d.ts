import React from "react";
import { History } from "history";
import { DocumentTitleFormatter } from "./DocumentTitle";
/**
 * Props of {@link HistoryRouter}
 */
export interface HistoryRouterProps {
    /**
     * The history to route with, a `History` of the history package (v5):
     * `createBrowserHistory()` in an app, `createMemoryHistory()` in tests and
     * stories. Framework renders a HistoryRouter with `FrameworkHistory`, so an
     * app inside Framework doesn't add one.
     */
    history: History;
    /**
     * The routed content: `Routes`, `Route`, `Link` and everything that uses
     * the routing hooks
     */
    children: React.ReactNode;
    /**
     * Builds the document title from the page titles that `PageTitle` headings
     * and `usePageTitle` set, whenever one of them changes, see
     * {@link DocumentTitleFormatter}.
     * Default: the most specific page title and the app title (the document's
     * title when the router mounted), joined by " – ", e.g.
     * "Device 4711 – Samedis.care"; the app title alone when no page title is
     * set.
     * The router changes the document title only once a page title is set, and
     * sets the app title again when it unmounts. A HistoryRouter inside another
     * one hands its page titles to the outer one and ignores this prop.
     */
    formatDocumentTitle?: DocumentTitleFormatter;
}
/**
 * The value of {@link HistoryRouterContext}
 */
export interface HistoryRouterContextType {
    /**
     * The history of the nearest HistoryRouter
     */
    history: History;
}
/**
 * The history of the nearest HistoryRouter, null outside of one. Read it with
 * {@link useHistoryRouterContext}.
 */
export declare const HistoryRouterContext: React.Context<HistoryRouterContextType | null>;
/**
 * The history of the nearest HistoryRouter, e.g. for `history.back()`, which
 * `useNavigate` has no counterpart for.
 * Throws outside a HistoryRouter; Framework renders one.
 * @returns The context of the nearest HistoryRouter
 */
export declare const useHistoryRouterContext: () => HistoryRouterContextType;
declare const _default: React.MemoExoticComponent<(props: HistoryRouterProps) => React.JSX.Element>;
export default _default;
