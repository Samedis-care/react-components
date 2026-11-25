import React from "react";
import { Action } from "history";
import { FrameworkHistory } from "./History";
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
export class NavigationGuard {
    entries = [];
    unblock = null;
    // set while a navigation that was let through is on its way, see pass
    stopWaiting = null;
    // the open question, and the navigation it answers for
    question = null;
    // the entry whose changes the user has confirmed leaving already, see leave
    confirmed = null;
    /**
     * Guards the changes of an entry: from now on, a navigation that leaves them asks first
     * @param entry The entry; adding one that is added already does nothing
     * @returns Removes the entry again, e.g. once its changes are saved
     */
    add(entry) {
        if (!this.entries.includes(entry))
            this.entries = [...this.entries, entry];
        this.update();
        return () => {
            this.entries = this.entries.filter((other) => other !== entry);
            this.update();
        };
    }
    /**
     * Runs go, which leaves the changes of an entry after the user has confirmed it (a form
     * page's Back): a navigation that go starts while it runs does not ask about this entry
     * again. It still asks about the other entries it leaves. The entry stays guarded when go
     * does not leave it.
     * @param entry The entry the user confirmed leaving, null for none
     * @param go Starts the navigation, synchronously
     */
    leave(entry, go) {
        const previous = this.confirmed;
        this.confirmed = entry;
        try {
            go();
        }
        finally {
            this.confirmed = previous;
        }
    }
    // blocks the history while there are entries
    update() {
        // blocked again once the navigation that was let through has happened
        if (this.stopWaiting)
            return;
        if (this.entries.length > 0) {
            if (!this.unblock)
                this.unblock = FrameworkHistory.block(this.blocker);
        }
        else {
            this.release();
        }
    }
    release() {
        if (!this.unblock)
            return;
        this.unblock();
        this.unblock = null;
    }
    blocker = (transition) => {
        const leaving = this.entries.filter((entry) => entry.leaves(transition));
        const asking = leaving.filter((entry) => entry !== this.confirmed);
        if (asking.length === 0) {
            this.pass(transition, leaving);
            return;
        }
        if (this.question) {
            this.question.transition = transition;
            this.question.leaving = leaving;
            return;
        }
        const question = { transition, leaving };
        this.question = question;
        void asking[asking.length - 1].ask().then((leave) => {
            this.question = null;
            if (leave)
                this.pass(question.transition, question.leaving);
        }, () => {
            // the question failed: stay
            this.question = null;
        });
    };
    // lets a navigation through and blocks again once it has happened
    pass(transition, leaving) {
        this.stopWaitingForNavigation();
        this.release();
        let happened = false;
        // A browser history reverts every POP while a blocker is set and retries it
        // asynchronously (history.go), so block again only once the retried POP has arrived:
        // blocking at once would revert it again, and so on forever.
        this.stopWaiting = FrameworkHistory.listen(() => {
            happened = true;
            this.stopWaitingForNavigation();
            for (const entry of leaving)
                this.drop(entry);
            this.update();
        });
        transition.retry();
        // PUSH and REPLACE are retried synchronously: one that has not happened was stopped by
        // another blocker, so everything stays guarded
        if (!happened && transition.action !== Action.Pop) {
            this.stopWaitingForNavigation();
            this.update();
        }
    }
    stopWaitingForNavigation() {
        if (!this.stopWaiting)
            return;
        this.stopWaiting();
        this.stopWaiting = null;
    }
    // removes an entry a confirmed navigation has left
    drop(entry) {
        if (!this.entries.includes(entry))
            return;
        this.entries = this.entries.filter((other) => other !== entry);
        entry.onLeft();
    }
}
/**
 * The NavigationGuard of the Framework; null outside of one
 */
export const NavigationGuardContext = React.createContext(null);
