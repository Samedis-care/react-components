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
     * title is set in, -1 outside of any route. Counted across nested
     * HistoryRouters, see PageRankOffsetContext.
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
 * DocumentTitleProvider instance. The registry of a HistoryRouter inside
 * another one hands each title and heading on to the outer one's, which
 * writes the document title; it keeps them for its own router, which moves
 * the focus only to a heading set inside it.
 */
export declare class PageTitleRegistry {
    private readonly appTitle;
    /**
     * The registry of the HistoryRouter around the one this registry belongs
     * to, null in the outermost one
     */
    private readonly outer;
    private readonly entries;
    private readonly headings;
    private readonly listeners;
    private format;
    private active;
    private wrote;
    /**
     * @param appTitle The document's title when the HistoryRouter mounted
     * @param outer The registry of the HistoryRouter around the one this
     * registry belongs to, which gets every title and heading set here too;
     * null in the outermost one
     */
    constructor(appTitle: string, outer: PageTitleRegistry | null);
    /**
     * Sets or removes a page title, here and in the outer registries
     * @param key The component that sets it
     * @param entry The title, null to remove it
     */
    set(key: object, entry: PageTitleEntry | null): void;
    /**
     * Sets or removes the heading of a page, here and in the outer registries
     * @param key The component that sets it
     * @param entry The heading, null to remove it
     */
    setHeading(key: object, entry: PageHeadingEntry | null): void;
    /**
     * The page title: the most specific one set inside the HistoryRouter, as
     * the document title shows it
     * @returns The title, null when none is set
     */
    pageTitle(): string | null;
    /**
     * The headings of the pages set inside the HistoryRouter, the most
     * specific first
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
 * The registry of the page titles and headings of the nearest HistoryRouter,
 * null outside of every HistoryRouter. Inside another HistoryRouter, it hands
 * them on to the outer one's, which writes the document title.
 * @returns The registry
 */
export declare const usePageTitleRegistry: () => PageTitleRegistry | null;
/**
 * Sets a page title while the calling component is mounted. Used by
 * usePageTitle.
 * @param title The page title; null, undefined or "" set none
 * @param depth The depth of the calling component's route within its
 * HistoryRouter, -1 outside of every route
 */
export declare const useRegisterPageTitle: (title: string | null | undefined, depth: number) => void;
/**
 * Makes an element the page's heading while the calling component is mounted:
 * after a navigation that leaves the focus on no element or out of view, the
 * focus moves to the most specific page heading. Used by PageTitle.
 * @param heading A ref to the heading element, null for none
 * @param depth The depth of the calling component's route within its
 * HistoryRouter, -1 outside of every route
 */
export declare const useRegisterPageHeading: (heading: React.RefObject<HTMLElement | null> | null, depth: number) => void;
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
