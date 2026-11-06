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

/**
 * Collects the page titles of one HistoryRouter and writes the document title
 * from them. Owned by one DocumentTitleProvider instance.
 */
class PageTitleRegistry {
	private readonly appTitle: string;
	private readonly entries = new Map<object, PageTitleEntry>();
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
		// a stable sort of the reversed entries: of equally specific titles, the
		// one set last comes first
		const titles = Array.from(this.entries.values())
			.reverse()
			.sort((a, b) => b.rank - a.rank)
			.map((entry) => entry.title);
		document.title = this.format(titles, this.appTitle);
		this.wrote = true;
	}
}

const PageTitleRegistryContext = React.createContext<PageTitleRegistry | null>(
	null,
);

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
