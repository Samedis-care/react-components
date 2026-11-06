import { jsx as _jsx } from "react/jsx-runtime";
import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
/**
 * The default {@link DocumentTitleFormatter}: the most specific page title and
 * the app title, joined by " – ", e.g. "Device 4711 – Samedis.care"; the app
 * title alone when no page title is set.
 * @param pageTitles The page titles, the most specific first
 * @param appTitle The app title
 */
const defaultFormatDocumentTitle = (pageTitles, appTitle) => [pageTitles[0], appTitle].filter(Boolean).join(" – ");
/**
 * Collects the page titles of one HistoryRouter and writes the document title
 * from them. Owned by one DocumentTitleProvider instance.
 */
class PageTitleRegistry {
    appTitle;
    entries = new Map();
    format = defaultFormatDocumentTitle;
    // written only between activate and deactivate (the provider's effect)
    active = false;
    // the document title is left alone until the first page title is set
    wrote = false;
    constructor(appTitle) {
        this.appTitle = appTitle;
    }
    set(key, entry) {
        if (entry)
            this.entries.set(key, entry);
        else
            this.entries.delete(key);
        this.write();
    }
    setFormat(format) {
        this.format = format;
        this.write();
    }
    activate() {
        this.active = true;
        this.write();
    }
    deactivate() {
        this.active = false;
        if (this.wrote)
            document.title = this.appTitle;
        this.wrote = false;
    }
    write() {
        if (!this.active || (!this.wrote && this.entries.size === 0))
            return;
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
const PageTitleRegistryContext = React.createContext(null);
/**
 * Sets a page title while the calling component is mounted. Used by
 * usePageTitle.
 * @param title The page title; null, undefined or "" set none
 * @param rank How specific the title is, see PageTitleEntry
 */
export const useRegisterPageTitle = (title, rank) => {
    const registry = useContext(PageTitleRegistryContext);
    const [key] = useState(() => ({}));
    useEffect(() => {
        if (!registry || !title)
            return;
        registry.set(key, { title, rank });
        return () => registry.set(key, null);
    }, [registry, key, title, rank]);
};
/**
 * Writes the document title from the page titles of its children. Rendered by
 * HistoryRouter. Inside another one it hands the titles to the outer one and
 * ignores its formatDocumentTitle.
 * @param props The props
 */
const DocumentTitleProvider = (props) => {
    const { formatDocumentTitle, children } = props;
    const outer = useContext(PageTitleRegistryContext);
    const [registry] = useState(() => new PageTitleRegistry(typeof document === "undefined" ? "" : document.title));
    // a layout effect: in place before the children's effects write with it
    useLayoutEffect(() => {
        registry.setFormat(formatDocumentTitle ?? defaultFormatDocumentTitle);
    }, [registry, formatDocumentTitle]);
    // runs after the children's effects, so the first title is written once
    useEffect(() => {
        if (outer)
            return;
        registry.activate();
        return () => registry.deactivate();
    }, [outer, registry]);
    return (_jsx(PageTitleRegistryContext.Provider, { value: outer ?? registry, children: children }));
};
export default React.memo(DocumentTitleProvider);
