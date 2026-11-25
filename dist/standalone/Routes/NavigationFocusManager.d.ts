import { Action } from "history";
import type { PageTitleRegistry } from "./DocumentTitle";
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
export declare class NavigationFocusManager {
    /**
     * Set while the NavigationFocus is mounted, from the end of its mount on:
     * a navigation of the children's mount effects (a redirect) is part of
     * loading the page, not one to handle
     */
    private target;
    /**
     * idle: no navigation to handle; navigated: a navigation happened and has
     * not rendered yet; settling: it rendered, and the focus move or the
     * announcement waits for the new page
     */
    private phase;
    /**
     * The focus rests on an element in view or was moved to the page's heading
     */
    private focusDone;
    /**
     * The new page was announced, or needs no announcement (its heading got the
     * focus, which a screen reader reads)
     */
    private announceDone;
    /**
     * The page title before the navigation, which needs no announcement
     */
    private titleBefore;
    private unsubscribe;
    private announceTimer;
    /**
     * Starts handling navigations, see target
     * @param target The page titles and headings, and the live region
     */
    attach(target: NavigationFocusTarget): void;
    /**
     * Stops handling navigations, and drops what the last one waited for
     */
    detach(): void;
    /**
     * A navigation happened, before it renders. A push or back/forward
     * navigation drops what the previous one still waited for, a replace is
     * left alone.
     * @param action The navigation's action
     */
    navigated(action: Action): void;
    /**
     * The navigation's location rendered: checks the focus now, and again
     * whenever a page title or heading is set, until both the focus and the
     * announcement are done or the user moves on
     */
    rendered(): void;
    /**
     * Stops waiting for the new page: on the next navigation, user input and
     * detach
     */
    private readonly stop;
    private readonly check;
    private readonly announceTitle;
}
export {};
