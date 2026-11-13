export const initialToastState = {
    current: null,
    open: false,
    next: null,
};
/**
 * One toast at a time: a new toast closes the current one and is shown once
 * that has closed. Only the newest toast waits, older ones are dropped. A
 * current toast closed before it was in the page (two toasts in one update)
 * has closed at once: the Toast calls onExited right after rendering it closed
 */
export const toastReducer = (state, action) => {
    switch (action.type) {
        case "show":
            if (!state.current)
                return { current: action.toast, open: true, next: null };
            return { current: state.current, open: false, next: action.toast };
        case "close":
            if (!state.current)
                return state;
            return { current: state.current, open: false, next: null };
        case "exited":
            if (state.next)
                return { current: state.next, open: true, next: null };
            return initialToastState;
    }
};
