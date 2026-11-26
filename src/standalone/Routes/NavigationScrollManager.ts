import type { RefObject } from "react";
import { Action, type History, type To, type Update } from "history";
import { navigationTarget, normalizedUrl } from "./navigationTarget";

/**
 * Scrolls an element to the start, horizontally too
 * @param element The element
 */
const scrollToStart = (element: Element): void => {
	element.scrollTop = 0;
	element.scrollLeft = 0;
};

/**
 * A scroll container registered with useResetScrollOnNavigation
 */
interface ScrollContainerEntry {
	/** The container; the element it holds when a navigation happens is reset */
	ref: RefObject<HTMLElement | null>;
}

/**
 * Resets the scroll positions after the navigations of one HistoryRouter: a
 * push or replace scrolls the window, the document and the registered scroll
 * containers to the top, unless useNavigate started it with
 * `preventScrollReset`. Back/forward navigations leave the scroll positions
 * alone. HistoryRouter owns one and reports the navigations that happen;
 * useNavigate reports the navigations it starts, and
 * useResetScrollOnNavigation registers the containers.
 */
export class NavigationScrollManager {
	private readonly containers = new Set<ScrollContainerEntry>();
	/**
	 * The URL a navigation with `preventScrollReset` goes to, from the call
	 * that starts it until the next navigation happens: a blocker (the leave
	 * guard of a form) may hold it back and let it go ahead later, to the same
	 * URL
	 */
	private keepScrollAt: string | null = null;

	/**
	 * Resets the scroll position of a container after each navigation that
	 * resets the window's
	 * @param ref The container
	 * @returns Removes the container again
	 */
	public register(ref: RefObject<HTMLElement | null>): () => void {
		const entry: ScrollContainerEntry = { ref };
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
	public navigating(
		history: History,
		to: To,
		preventScrollReset: boolean,
	): void {
		this.keepScrollAt = preventScrollReset
			? normalizedUrl(navigationTarget(history.location, to))
			: null;
	}

	/**
	 * A navigation happened (a blocked one never gets here): resets the scroll
	 * positions unless it is a back/forward navigation or the one started with
	 * `preventScrollReset`
	 * @param update The navigation
	 */
	public navigated(update: Update): void {
		const keepScrollAt = this.keepScrollAt;
		this.keepScrollAt = null;
		if (update.action === Action.Pop) return;
		if (keepScrollAt === normalizedUrl(update.location)) return;
		window.scrollTo(0, 0);
		scrollToStart(document.documentElement);
		scrollToStart(document.body);
		this.containers.forEach((entry) => {
			if (entry.ref.current) scrollToStart(entry.ref.current);
		});
	}
}
