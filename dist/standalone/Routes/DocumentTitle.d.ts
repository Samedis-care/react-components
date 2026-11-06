import React from "react";
/**
 * Builds the document title (the title of the browser tab, the window and the
 * history entries) from the page titles.
 * @param pageTitles The titles set by `PageTitle` headings and by
 * `usePageTitle`, the most specific first (the one in the deepest route);
 * empty when none is set
 * @param appTitle The document's title when the HistoryRouter mounted, i.e.
 * the `<title>` of the app's index.html
 * @returns The document title
 */
export type DocumentTitleFormatter = (pageTitles: readonly string[], appTitle: string) => string;
/**
 * Sets a page title while the calling component is mounted. Used by
 * usePageTitle.
 * @param title The page title; null, undefined or "" set none
 * @param rank How specific the title is, see PageTitleEntry
 */
export declare const useRegisterPageTitle: (title: string | null | undefined, rank: number) => void;
export interface DocumentTitleProviderProps {
    /**
     * See HistoryRouterProps.formatDocumentTitle
     */
    formatDocumentTitle: DocumentTitleFormatter | undefined;
    /**
     * The routed content
     */
    children: React.ReactNode;
}
declare const _default: React.MemoExoticComponent<(props: DocumentTitleProviderProps) => React.JSX.Element>;
export default _default;
