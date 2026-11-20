import { Action } from "history";
import type { PageTitleRegistry } from "./DocumentTitle";

/**
 * User input after which a focus move or announcement that still waits for the
 * new page is dropped: the user has moved on (clicked, typed, scrolled)
 */
const USER_INPUT_EVENTS = ["pointerdown", "keydown", "wheel"] as const;

/**
 * How long the page title has to stay the same before it is announced, in ms:
 * a new page sets its title a few renders after it mounts, and until then the
 * title of an enclosing route is the page title
 */
const ANNOUNCE_DELAY = 100;

/**
 * Is the element rendered: in the document and not hidden with
 * `display: none` (also not inside a hidden ancestor)?
 * @param element The element
 */
const isRendered = (element: Element): boolean =>
	element.isConnected && element.getClientRects().length > 0;

/**
 * Does the keyboard focus rest on an element the user can see? Not when it is
 * on `<body>` (the focused element was removed, or nothing was focused), on a
 * hidden element, or on an element outside the viewport.
 */
const focusIsInView = (): boolean => {
	const active = document.activeElement;
	if (
		!active ||
		active === document.body ||
		active === document.documentElement ||
		!isRendered(active)
	)
		return false;
	const rect = active.getBoundingClientRect();
	return (
		rect.bottom > 0 &&
		rect.right > 0 &&
		rect.top < window.innerHeight &&
		rect.left < window.innerWidth
	);
};

/**
 * Can the heading take the focus as the page's heading: rendered and with
 * text to read?
 * @param heading The heading element
 */
const isUsableHeading = (heading: Element): boolean =>
	isRendered(heading) && !!heading.textContent?.trim();

/**
 * The heading of the page: the most specific PageTitle (see usePageHeading)
 * that is rendered and has text, else the first `<h1>` of the main landmark
 * (`<main>` or `role="main"`) that is
 * @param registry The registry of the page headings
 * @returns The heading, null when the page has none (yet)
 */
const findPageHeading = (
	registry: PageTitleRegistry | null,
): HTMLElement | null => {
	const registered = registry?.pageHeadings().find(isUsableHeading);
	if (registered) return registered;
	for (const main of Array.from(
		document.querySelectorAll("main, [role='main']"),
	)) {
		const heading = Array.from(main.querySelectorAll<HTMLElement>("h1")).find(
			isUsableHeading,
		);
		if (heading) return heading;
	}
	return null;
};

/**
 * Moves the keyboard focus to a heading. A heading is not focusable by itself:
 * `tabindex="-1"` makes it focusable without adding it to the tab order.
 * @param heading The heading element
 */
const focusHeading = (heading: HTMLElement): void => {
	if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
	heading.focus();
};

/**
 * Where a NavigationFocusManager finds the page and announces it
 */
interface NavigationFocusTarget {
	/**
	 * The page titles and headings
	 */
	registry: PageTitleRegistry | null;
	/**
	 * Sets the text of the live region
	 */
	announce: (text: string) => void;
}

/**
 * Moves the keyboard focus and announces the new page after the navigations of
 * one HistoryRouter, see NavigationFocus. HistoryRouter owns one and reports
 * its navigations; the NavigationFocus it renders attaches the page title
 * registry and the live region.
 */
export class NavigationFocusManager {
	/**
	 * Set while the NavigationFocus is mounted, from the end of its mount on:
	 * a navigation of the children's mount effects (a redirect) is part of
	 * loading the page, not one to handle
	 */
	private target: NavigationFocusTarget | null = null;
	/**
	 * idle: no navigation to handle; navigated: a navigation happened and has
	 * not rendered yet; settling: it rendered, and the focus move or the
	 * announcement waits for the new page
	 */
	private phase: "idle" | "navigated" | "settling" = "idle";
	/**
	 * The focus rests on an element in view or was moved to the page's heading
	 */
	private focusDone = false;
	/**
	 * The new page was announced, or needs no announcement (its heading got the
	 * focus, which a screen reader reads)
	 */
	private announceDone = false;
	/**
	 * The page title before the navigation, which needs no announcement
	 */
	private titleBefore: string | null = null;
	private unsubscribe: (() => void) | null = null;
	private announceTimer: ReturnType<typeof setTimeout> | null = null;

	/**
	 * Starts handling navigations, see target
	 * @param target The page titles and headings, and the live region
	 */
	public attach(target: NavigationFocusTarget): void {
		this.stop();
		this.target = target;
	}

	/**
	 * Stops handling navigations, and drops what the last one waited for
	 */
	public detach(): void {
		this.stop();
		this.target = null;
	}

	/**
	 * A navigation happened, before it renders. A push or back/forward
	 * navigation drops what the previous one still waited for, a replace is
	 * left alone.
	 * @param action The navigation's action
	 */
	public navigated(action: Action): void {
		if (!this.target || action === Action.Replace) return;
		this.stop();
		this.phase = "navigated";
		this.focusDone = false;
		this.announceDone = false;
		this.titleBefore = this.target.registry?.pageTitle() ?? null;
		this.target.announce("");
	}

	/**
	 * The navigation's location rendered: checks the focus now, and again
	 * whenever a page title or heading is set, until both the focus and the
	 * announcement are done or the user moves on
	 */
	public rendered(): void {
		if (this.phase !== "navigated" || !this.target) return;
		this.phase = "settling";
		this.unsubscribe = this.target.registry?.subscribe(this.check) ?? null;
		USER_INPUT_EVENTS.forEach((type) =>
			document.addEventListener(type, this.stop, true),
		);
		this.check();
	}

	/**
	 * Stops waiting for the new page: on the next navigation, user input and
	 * detach
	 */
	private readonly stop = (): void => {
		this.phase = "idle";
		this.unsubscribe?.();
		this.unsubscribe = null;
		if (this.announceTimer !== null) clearTimeout(this.announceTimer);
		this.announceTimer = null;
		USER_INPUT_EVENTS.forEach((type) =>
			document.removeEventListener(type, this.stop, true),
		);
	};

	private readonly check = (): void => {
		if (this.phase !== "settling" || !this.target) return;
		if (!this.focusDone) {
			if (focusIsInView()) {
				this.focusDone = true;
			} else {
				const heading = findPageHeading(this.target.registry);
				if (heading) {
					focusHeading(heading);
					this.focusDone = true;
					this.announceDone = true;
				}
			}
		}
		if (this.focusDone && this.announceDone) {
			this.stop();
			return;
		}
		if (!this.announceDone) {
			if (this.announceTimer !== null) clearTimeout(this.announceTimer);
			this.announceTimer = setTimeout(this.announceTitle, ANNOUNCE_DELAY);
		}
	};

	private readonly announceTitle = (): void => {
		this.announceTimer = null;
		if (this.phase !== "settling" || this.announceDone || !this.target) return;
		const title = this.target.registry?.pageTitle() ?? null;
		if (!title || title === this.titleBefore) return;
		this.target.announce(title);
		this.announceDone = true;
		if (this.focusDone) this.stop();
	};
}
