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
interface PageTitleEntry {
    title: string;
    /**
     * How specific the title is, the highest wins: the depth of the route the
     * title is set in, -1 outside of any route
     */
    rank: number;
}
interface PageHeadingEntry {
    /**
     * The heading element (a PageTitle), read when a navigation looks for the
     * page's heading
     */
    heading: React.RefObject<HTMLElement | null>;
    /**
     * How specific the heading is, as PageTitleEntry.rank
     */
    rank: number;
}
/**
 * Collects the page titles and the page headings of one HistoryRouter and
 * writes the document title from the titles. Owned by one
 * DocumentTitleProvider instance.
 */
export declare class PageTitleRegistry {
    private readonly appTitle;
    private readonly entries;
    private readonly headings;
    private readonly listeners;
    private format;
    private active;
    private wrote;
    constructor(appTitle: string);
    set(key: object, entry: PageTitleEntry | null): void;
    /**
     * Sets or removes the heading of a page
     * @param key The component that sets it
     * @param entry The heading, null to remove it
     */
    setHeading(key: object, entry: PageHeadingEntry | null): void;
    /**
     * The page title: the most specific one, as the document title shows it
     * @returns The title, null when none is set
     */
    pageTitle(): string | null;
    /**
     * The headings of the pages, the most specific first
     * @returns The heading elements that are mounted
     */
    pageHeadings(): HTMLElement[];
    /**
     * Calls listener whenever a page title or a page heading is set or removed
     * @param listener The function to call
     * @returns A function that stops the calls
     */
    subscribe(listener: () => void): () => void;
    private notify;
    setFormat(format: DocumentTitleFormatter): void;
    activate(): void;
    deactivate(): void;
    private write;
}
/**
 * The registry of the page titles and headings that the nearest HistoryRouter
 * writes the document title from (the outermost one's, when HistoryRouters
 * are nested), null outside of every HistoryRouter
 * @returns The registry
 */
export declare const usePageTitleRegistry: () => PageTitleRegistry | null;
/**
 * Sets a page title while the calling component is mounted. Used by
 * usePageTitle.
 * @param title The page title; null, undefined or "" set none
 * @param rank How specific the title is, see PageTitleEntry
 */
export declare const useRegisterPageTitle: (title: string | null | undefined, rank: number) => void;
/**
 * Makes an element the page's heading while the calling component is mounted:
 * after a navigation that leaves the focus on no element or out of view, the
 * focus moves to the most specific page heading. Used by PageTitle.
 * @param heading A ref to the heading element, null for none
 * @param rank How specific the heading is, see PageTitleEntry
 */
export declare const useRegisterPageHeading: (heading: React.RefObject<HTMLElement | null> | null, rank: number) => void;
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
