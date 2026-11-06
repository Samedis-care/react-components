import React from "react";
import { History } from "history";
import { DocumentTitleFormatter } from "./DocumentTitle";
export interface HistoryRouterProps {
    history: History;
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
export interface HistoryRouterContextType {
    history: History;
}
export declare const HistoryRouterContext: React.Context<HistoryRouterContextType | null>;
export declare const useHistoryRouterContext: () => HistoryRouterContextType;
declare const _default: React.MemoExoticComponent<(props: HistoryRouterProps) => React.JSX.Element>;
export default _default;
