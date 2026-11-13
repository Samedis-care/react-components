import { useCallback, useEffect, useRef, useState } from "react";
/**
 * The class MUI puts on the root of a picker's desktop popup
 * (`pickerPopperClasses.root`)
 */
const POPPER_ROOT_SELECTOR = ".MuiPickerPopper-root";
/**
 * The blur event for focus that leaves from the open popup, shaped like the
 * field's own: React reports no blur to the field for it, the popup being
 * portaled outside the field.
 * @param field The field's input root, the event's `currentTarget`
 * @param lostFocus The element of the popup that had focus last, the event's
 * `target`
 * @param focusIn The native `focusin` of the element that got focus, which is
 * the event's `relatedTarget`
 * @returns The event
 */
const popupBlurEvent = (field, lostFocus, focusIn) => ({
    nativeEvent: focusIn,
    type: "blur",
    currentTarget: field,
    target: lostFocus,
    relatedTarget: focusIn.target,
    bubbles: true,
    cancelable: false,
    defaultPrevented: false,
    eventPhase: Event.BUBBLING_PHASE,
    isTrusted: focusIn.isTrusted,
    timeStamp: focusIn.timeStamp,
    preventDefault: () => { },
    isDefaultPrevented: () => false,
    stopPropagation: () => { },
    isPropagationStopped: () => false,
    persist: () => { },
});
/**
 * Follows focus once it has moved from a picker's field into its open desktop
 * popup, and reports when it arrives somewhere outside both.
 *
 * Focus that moves inside the popup keeps it following, and so does focus that
 * goes to no element (the window losing focus): the next element to get focus
 * decides. Focus that comes back to the field (the popup hands it back when it
 * closes) ends it without a report, the field's own blur taking over.
 * @param onLeave Called once focus arrives outside the field and the popup,
 * with the blur event to report
 * @returns The watch, following nothing yet
 */
const createPopupFocusWatch = (onLeave) => {
    let watched = null;
    const handleFocusIn = (event) => {
        if (!watched)
            return;
        const { field, popup, lastFocused } = watched;
        const next = event.target;
        if (next instanceof Element && popup.contains(next)) {
            watched.lastFocused = next;
            return;
        }
        stop();
        if (next instanceof Node && field.contains(next))
            return;
        onLeave(popupBlurEvent(field, lastFocused, event));
    };
    const stop = () => {
        if (!watched)
            return;
        watched.field.ownerDocument.removeEventListener("focusin", handleFocusIn, true);
        watched = null;
    };
    return {
        start: (field, popup, entered) => {
            stop();
            watched = { field, popup, lastFocused: entered };
            field.ownerDocument.addEventListener("focusin", handleFocusIn, true);
        },
        stop,
    };
};
/**
 * Calls a picker field's `onBlur` once focus leaves the field, by any route.
 *
 * MUI's field calls the text field's `onBlur` whenever focus leaves the element
 * that holds the sections: also when it moves on to the open-picker button or
 * another adornment of the same field, and never when it later leaves from one
 * of those. The function this returns takes the `onBlur` off the text field
 * props and calls it from the blur of the field's input root (`role="group"`,
 * which holds the sections and the adornments) instead, only when focus goes
 * somewhere outside it.
 *
 * The open popup counts as part of the field: it takes focus when it opens and
 * hands it back to the field when it closes. Focus that leaves from inside the
 * open desktop popup for another element (a click on another control while the
 * calendar is open) calls `onBlur` too, once that element gets focus; focus
 * that goes to no element meanwhile (the window losing focus) is not leaving.
 * The mobile dialog is modal, so focus only leaves it by closing it.
 *
 * The handler receives the root's focus event: `currentTarget` is the input
 * root, `target` the section or button that lost focus. When focus leaves from
 * the popup, the event is made in that shape from the native `focusin` of the
 * element that got focus (`nativeEvent`): `target` is the element of the popup
 * that had focus, `relatedTarget` the element that got it. The `onBlur` of the
 * latest render is called. A blur handler the caller set on the input root
 * (`slotProps.input.slotProps.root.onBlur`) is kept and still sees every blur
 * of the root.
 *
 * `onFieldFocus`, if given, is called from the input root's focus, whenever
 * focus enters the field or moves within it; a focus handler the caller set on
 * the input root is kept.
 * @returns The function to resolve the `textField` slot props with, the same
 * for the life of the component
 */
const useFieldBlur = () => {
    // focus that leaves from the popup is reported later, to the latest onBlur
    const onBlurRef = useRef(undefined);
    const [popupWatch] = useState(() => createPopupFocusWatch((event) => onBlurRef.current?.(event)));
    useEffect(() => popupWatch.stop, [popupWatch]);
    return useCallback((ownerState, textFieldProps, onFieldFocus) => {
        const { onBlur, slotProps: slotPropsProp } = textFieldProps;
        onBlurRef.current = onBlur;
        if (!onBlur && !onFieldFocus)
            return textFieldProps;
        const slotProps = slotPropsProp ?? {};
        const input = slotProps.input ?? {};
        const root = input.slotProps?.root;
        const handleRootBlur = (event) => {
            root?.onBlur?.(event);
            if (!onBlur)
                return;
            const field = event.currentTarget;
            const next = event.relatedTarget;
            if (next instanceof Node && field.contains(next))
                return;
            if (ownerState.isPickerOpen) {
                // the mobile dialog is modal: while it is open, focus can only go
                // into it, and it hands focus back to the field when it closes
                if (ownerState.pickerVariant === "mobile")
                    return;
                const popup = next?.closest(POPPER_ROOT_SELECTOR);
                if (next && popup) {
                    popupWatch.start(field, popup, next);
                    return;
                }
            }
            onBlur(event);
        };
        return {
            ...textFieldProps,
            onBlur: undefined,
            slotProps: {
                ...slotProps,
                input: {
                    ...input,
                    slotProps: {
                        ...input.slotProps,
                        root: {
                            ...root,
                            onBlur: handleRootBlur,
                            ...(onFieldFocus && {
                                onFocus: (event) => {
                                    root?.onFocus?.(event);
                                    onFieldFocus();
                                },
                            }),
                        },
                    },
                },
            },
        };
    }, [popupWatch]);
};
export default useFieldBlur;
