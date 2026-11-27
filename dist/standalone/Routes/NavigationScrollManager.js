import { Action, } from "history";
import { navigationTarget, normalizedUrl } from "./navigationTarget";
/**
 * Scrolls an element to the start, horizontally too
 * @param element The element
 */
const scrollToStart = (element) => {
    element.scrollTop = 0;
    element.scrollLeft = 0;
};
/**
 * The fragment of a hash: without its "#", which a location object may also
 * leave out
 * @param hash The hash of a location
 */
const fragmentOf = (hash) => hash.replace(/^#/, "");
/**
 * Do two locations show the same page: the same pathname and search, compared
 * as the URL parser reads them? A navigation between them changes the hash at
 * most.
 * @param a A location
 * @param b Another location
 */
const isSamePage = (a, b) => normalizedUrl({ pathname: a.pathname, search: a.search }) ===
    normalizedUrl({ pathname: b.pathname, search: b.search });
/**
 * The element a fragment names, as a browser finds the target of a link to a
 * fragment: the element with that id, the fragment taken as written and
 * percent-decoded (a browser history keeps it encoded, "%C3%BCber"). A
 * fragment that names no element but reads "top" (in any case) stands for
 * the top of the page.
 * @param fragment The fragment, without "#"
 * @returns The element, "top", or null when the fragment names neither
 */
const findAnchor = (fragment) => {
    let decoded = fragment;
    try {
        decoded = decodeURIComponent(fragment);
    }
    catch {
        // not percent-encoded: only as written
    }
    const element = document.getElementById(fragment) ?? document.getElementById(decoded);
    if (element)
        return element;
    return decoded.toLowerCase() === "top" ? "top" : null;
};
/**
 * Moves the keyboard focus to the element a navigation to a fragment leads
 * to, so that the next Tab goes on after it, as after a link to a fragment
 * in a browser. An element that can take the focus (a link, a control, an
 * element with a tabindex) gets it as it is. Any other gets `tabindex="-1"`,
 * which makes it focusable without adding it to the tab order; one that
 * cannot take the focus even then (hidden, disabled) keeps its attributes,
 * and the focus stays where it is.
 * @param element The element
 */
const focusAnchor = (element) => {
    element.focus({ preventScroll: true });
    if (document.activeElement === element || element.hasAttribute("tabindex"))
        return;
    element.setAttribute("tabindex", "-1");
    element.focus({ preventScroll: true });
    if (document.activeElement !== element)
        element.removeAttribute("tabindex");
};
/**
 * Sets the scroll positions after the navigations of one HistoryRouter:
 * - A push or replace scrolls the window, the document and the registered
 *   scroll containers to the top, unless useNavigate started it with
 *   `preventScrollReset`. The one of a HistoryRouter inside another one
 *   scrolls only the registered scroll containers, which are part of its
 *   content: the window and the document belong to the page around it.
 * - One to a location with a hash then scrolls the element the hash names into
 *   view and focuses it, once the location has rendered. When the hash is all
 *   it changes, nothing scrolls to the top first, as a link to a fragment of
 *   the page in a browser.
 * - Back/forward navigations leave the scroll positions alone.
 *
 * HistoryRouter owns one and reports the navigations that happen; useNavigate
 * reports the navigations it starts, NavigationScroll the locations rendered,
 * and useResetScrollOnNavigation registers the containers.
 */
export class NavigationScrollManager {
    containers = new Set();
    /**
     * The URL a navigation with `preventScrollReset` goes to, from the call
     * that starts it until the next navigation happens: a blocker (the leave
     * guard of a form) may hold it back and let it go ahead later, to the same
     * URL
     */
    keepScrollAt = null;
    /**
     * The location the router rendered last: the page on screen
     */
    shown = null;
    /**
     * The fragment the last navigation leads to, from the navigation until its
     * location renders, and whether the navigation stays on the page (changes
     * the hash only)
     */
    anchor = null;
    /**
     * Resets the scroll position of a container after each navigation that
     * resets the window's
     * @param ref The container
     * @returns Removes the container again
     */
    register(ref) {
        const entry = { ref };
        this.containers.add(entry);
        return () => {
            this.containers.delete(entry);
        };
    }
    /**
     * A navigation starts, before it reaches the history (which may block it)
     * @param history The history it navigates
     * @param to Its target, as passed to the history
     * @param preventScrollReset Does it keep the scroll positions?
     */
    navigating(history, to, preventScrollReset) {
        this.keepScrollAt = preventScrollReset
            ? normalizedUrl(navigationTarget(history.location, to))
            : null;
    }
    /**
     * A navigation happened, before it renders (a blocked one never gets
     * here): resets the scroll positions unless it is a back/forward
     * navigation, the one started with `preventScrollReset`, or one that
     * changes the hash only; for one to a hash, rendered scrolls to its
     * element
     * @param update The navigation
     * @param nested Is the router inside another one? Then it resets only the
     * registered scroll containers, not the window and the document.
     */
    navigated(update, nested) {
        const keepScrollAt = this.keepScrollAt;
        this.keepScrollAt = null;
        this.anchor = null;
        if (update.action === Action.Pop)
            return;
        const { location } = update;
        if (keepScrollAt === normalizedUrl(location))
            return;
        const fragment = fragmentOf(location.hash);
        if (fragment) {
            const samePage = !!this.shown && isSamePage(this.shown, location);
            this.anchor = { fragment, samePage };
            if (samePage)
                return;
        }
        this.scrollToTop(nested);
    }
    /**
     * A location rendered, in a layout effect after those of the router's
     * children and before the focus check of NavigationFocus: when a
     * navigation to a hash led to it, scrolls the element the hash names into
     * view (the window and the scroll containers around it) and moves the
     * focus to it. A hash that names no element leaves the page where the
     * navigation left it: at the top, or where it was when only the hash
     * changed; "#top" scrolls to the top then.
     * @param location The location the router rendered
     * @param nested Is the router inside another one? Then "#top" scrolls only
     * the registered scroll containers to the top.
     */
    rendered(location, nested) {
        this.shown = location;
        const anchor = this.anchor;
        this.anchor = null;
        if (!anchor)
            return;
        const target = findAnchor(anchor.fragment);
        if (target === "top") {
            if (anchor.samePage)
                this.scrollToTop(nested);
        }
        else if (target) {
            target.scrollIntoView({ block: "start", inline: "nearest" });
            focusAnchor(target);
        }
    }
    /**
     * Scrolls the window, the document and the registered scroll containers
     * to the top
     * @param nested Is the router inside another one? Then only the registered
     * scroll containers: the window and the document belong to the page
     * around it.
     */
    scrollToTop(nested) {
        if (!nested) {
            window.scrollTo(0, 0);
            scrollToStart(document.documentElement);
            scrollToStart(document.body);
        }
        this.containers.forEach((entry) => {
            if (entry.ref.current)
                scrollToStart(entry.ref.current);
        });
    }
}
