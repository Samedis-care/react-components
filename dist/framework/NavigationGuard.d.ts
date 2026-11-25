import React from "react";
import { Transition } from "history";
/**
 * Unsaved changes that a navigation can leave behind, such as those of a dirty Form. It is
 * added to a NavigationGuard while the changes exist.
 */
export interface NavigationGuardEntry {
    /**
     * Does the navigation leave the changes behind? A navigation that keeps them (one inside
     * the form page) passes without asking.
     * @param transition The navigation
     */
    leaves: (transition: Transition) => boolean;
    /**
     * Asks the user whether to leave the changes behind
     * @returns Resolves to true to leave, to false to stay
     */
    ask: () => Promise<boolean>;
    /**
     * Called once a navigation the user confirmed has left the changes behind: the guard has
     * removed the entry by then, add it again for the next changes
     */
    onLeft: () => void;
}
/**
 * Blocks the framework history while it has entries (unsaved changes) and asks before a
 * navigation leaves one: once per navigation, however many entries it leaves. A navigation
 * while the question is open does not ask again: the open question answers for it then.
 * After "Yes" the navigation is retried, and the entries it left are removed once it has
 * happened. The other entries stay guarded, and all of them do when the navigation does not
 * happen.
 *
 * Framework provides one to everything inside it, the pushed dialogs included
 * (NavigationGuardContext), so that the leave guards of all its Forms share one history
 * block.
 */
export declare class NavigationGuard {
    private entries;
    private unblock;
    private stopWaiting;
    private question;
    private confirmed;
    /**
     * Guards the changes of an entry: from now on, a navigation that leaves them asks first
     * @param entry The entry; adding one that is added already does nothing
     * @returns Removes the entry again, e.g. once its changes are saved
     */
    add(entry: NavigationGuardEntry): () => void;
    /**
     * Runs go, which leaves the changes of an entry after the user has confirmed it (a form
     * page's Back): a navigation that go starts while it runs does not ask about this entry
     * again. It still asks about the other entries it leaves. The entry stays guarded when go
     * does not leave it.
     * @param entry The entry the user confirmed leaving, null for none
     * @param go Starts the navigation, synchronously
     */
    leave(entry: NavigationGuardEntry | null, go: () => void): void;
    private update;
    private release;
    private blocker;
    private pass;
    private stopWaitingForNavigation;
    private drop;
}
/**
 * The NavigationGuard of the Framework; null outside of one
 */
export declare const NavigationGuardContext: React.Context<NavigationGuard | null>;
