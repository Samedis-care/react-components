import React, { useContext, useEffect, useLayoutEffect, useState } from "react";

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
export type DocumentTitleFormatter = (
	pageTitles: readonly string[],
	appTitle: string,
) => string;

/**
 * The default {@link DocumentTitleFormatter}: the most specific page title and
 * the app title, joined by " – ", e.g. "Device 4711 – Samedis.care"; the app
 * title alone when no page title is set.
 * @param pageTitles The page titles, the most specific first
 * @param appTitle The app title
 */
const defaultFormatDocumentTitle: DocumentTitleFormatter = (
	pageTitles,
	appTitle,
) => [pageTitles[0], appTitle].filter(Boolean).join(" – ");

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
 * Sorts entries the most specific first: the highest rank, and of equally
 * specific ones the one set last
 * @param entries The entries, in the order they were set
 * @returns The entries, the most specific first
 */
const mostSpecificFirst = <T extends { rank: number }>(
	entries: Map<object, T>,
): T[] =>
	// a stable sort of the reversed entries: of equally specific ones, the one
	// set last comes first
	Array.from(entries.values())
		.reverse()
		.sort((a, b) => b.rank - a.rank);

/**
 * Collects the page titles and the page headings of one HistoryRouter and
 * writes the document title from the titles. Owned by one
 * DocumentTitleProvider instance.
 */
export class PageTitleRegistry {
	private readonly appTitle: string;
	private readonly entries = new Map<object, PageTitleEntry>();
	private readonly headings = new Map<object, PageHeadingEntry>();
	private readonly listeners = new Set<() => void>();
	private format: DocumentTitleFormatter = defaultFormatDocumentTitle;
	// written only between activate and deactivate (the provider's effect)
	private active = false;
	// the document title is left alone until the first page title is set
	private wrote = false;

	public constructor(appTitle: string) {
		this.appTitle = appTitle;
	}

	public set(key: object, entry: PageTitleEntry | null): void {
		if (entry) this.entries.set(key, entry);
		else this.entries.delete(key);
		this.write();
		this.notify();
	}

	/**
	 * Sets or removes the heading of a page
	 * @param key The component that sets it
	 * @param entry The heading, null to remove it
	 */
	public setHeading(key: object, entry: PageHeadingEntry | null): void {
		if (entry) this.headings.set(key, entry);
		else this.headings.delete(key);
		this.notify();
	}

	/**
	 * The page title: the most specific one, as the document title shows it
	 * @returns The title, null when none is set
	 */
	public pageTitle(): string | null {
		return mostSpecificFirst(this.entries)[0]?.title ?? null;
	}

	/**
	 * The headings of the pages, the most specific first
	 * @returns The heading elements that are mounted
	 */
	public pageHeadings(): HTMLElement[] {
		return mostSpecificFirst(this.headings).flatMap((entry) =>
			entry.heading.current ? [entry.heading.current] : [],
		);
	}

	/**
	 * Calls listener whenever a page title or a page heading is set or removed
	 * @param listener The function to call
	 * @returns A function that stops the calls
	 */
	public subscribe(listener: () => void): () => void {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	private notify(): void {
		Array.from(this.listeners).forEach((listener) => listener());
	}

	public setFormat(format: DocumentTitleFormatter): void {
		this.format = format;
		this.write();
	}

	public activate(): void {
		this.active = true;
		this.write();
	}

	public deactivate(): void {
		this.active = false;
		if (this.wrote) document.title = this.appTitle;
		this.wrote = false;
	}

	private write(): void {
		if (!this.active || (!this.wrote && this.entries.size === 0)) return;
		const titles = mostSpecificFirst(this.entries).map((entry) => entry.title);
		document.title = this.format(titles, this.appTitle);
		this.wrote = true;
	}
}

const PageTitleRegistryContext = React.createContext<PageTitleRegistry | null>(
	null,
);

/**
 * The registry of the page titles and headings that the nearest HistoryRouter
 * writes the document title from (the outermost one's, when HistoryRouters
 * are nested), null outside of every HistoryRouter
 * @returns The registry
 */
export const usePageTitleRegistry = (): PageTitleRegistry | null =>
	useContext(PageTitleRegistryContext);

/**
 * Sets a page title while the calling component is mounted. Used by
 * usePageTitle.
 * @param title The page title; null, undefined or "" set none
 * @param rank How specific the title is, see PageTitleEntry
 */
export const useRegisterPageTitle = (
	title: string | null | undefined,
	rank: number,
): void => {
	const registry = useContext(PageTitleRegistryContext);
	const [key] = useState(() => ({}));
	useEffect(() => {
		if (!registry || !title) return;
		registry.set(key, { title, rank });
		return () => registry.set(key, null);
	}, [registry, key, title, rank]);
};

/**
 * Makes an element the page's heading while the calling component is mounted:
 * after a navigation that leaves the focus on no element or out of view, the
 * focus moves to the most specific page heading. Used by PageTitle.
 * @param heading A ref to the heading element, null for none
 * @param rank How specific the heading is, see PageTitleEntry
 */
export const useRegisterPageHeading = (
	heading: React.RefObject<HTMLElement | null> | null,
	rank: number,
): void => {
	const registry = useContext(PageTitleRegistryContext);
	const [key] = useState(() => ({}));
	// a layout effect: the heading of a page counts in the commit that mounts
	// it, before the router looks for it after the navigation
	useLayoutEffect(() => {
		if (!registry || !heading) return;
		registry.setHeading(key, { heading, rank });
		return () => registry.setHeading(key, null);
	}, [registry, key, heading, rank]);
};

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

/**
 * Writes the document title from the page titles of its children. Rendered by
 * HistoryRouter. Inside another one it hands the titles to the outer one and
 * ignores its formatDocumentTitle.
 * @param props The props
 */
const DocumentTitleProvider = (props: DocumentTitleProviderProps) => {
	const { formatDocumentTitle, children } = props;
	const outer = useContext(PageTitleRegistryContext);
	const [registry] = useState(
		() =>
			new PageTitleRegistry(
				typeof document === "undefined" ? "" : document.title,
			),
	);
	// a layout effect: in place before the children's effects write with it
	useLayoutEffect(() => {
		registry.setFormat(formatDocumentTitle ?? defaultFormatDocumentTitle);
	}, [registry, formatDocumentTitle]);
	// runs after the children's effects, so the first title is written once
	useEffect(() => {
		if (outer) return;
		registry.activate();
		return () => registry.deactivate();
	}, [outer, registry]);
	return (
		<PageTitleRegistryContext.Provider value={outer ?? registry}>
			{children}
		</PageTitleRegistryContext.Provider>
	);
};

export default React.memo(DocumentTitleProvider);
