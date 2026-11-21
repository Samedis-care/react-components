import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PickerOwnerState } from "@mui/x-date-pickers";

type FocusHandler = (event: React.FocusEvent<HTMLDivElement>) => void;

/** The part of the text field's slot props this helper reads and rewires */
interface TextFieldPropsWithBlur {
	name?: string;
	onBlur?: FocusHandler;
	slotProps?: {
		input?: {
			slotProps?: {
				root?: {
					ref?: React.Ref<HTMLDivElement>;
					onBlur?: FocusHandler;
					onFocus?: FocusHandler;
				};
			};
		};
	};
}

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
const popupBlurEvent = (
	field: HTMLDivElement,
	lostFocus: Element,
	focusIn: FocusEvent,
): React.FocusEvent<HTMLDivElement> => ({
	nativeEvent: focusIn,
	type: "blur",
	currentTarget: field,
	target: lostFocus as EventTarget & HTMLDivElement,
	relatedTarget: focusIn.target as EventTarget & Element,
	bubbles: true,
	cancelable: false,
	defaultPrevented: false,
	eventPhase: Event.BUBBLING_PHASE,
	isTrusted: focusIn.isTrusted,
	timeStamp: focusIn.timeStamp,
	preventDefault: () => {},
	isDefaultPrevented: () => false,
	stopPropagation: () => {},
	isPropagationStopped: () => false,
	persist: () => {},
});

/**
 * Follows focus in a picker's open desktop popup, see
 * {@link createPopupFocusWatch}
 */
interface PopupFocusWatch {
	/**
	 * Listens to focus in a document
	 * @param doc The document the field is in
	 * @returns Stops listening, and following, without a report
	 */
	listen: (doc: Document) => () => void;
}

/**
 * Follows focus once it has entered a picker's open desktop popup, and reports
 * when it arrives somewhere outside the field and the popup.
 *
 * It follows focus that enters the popup from anywhere: from the field, and
 * from outside it, as when a controlled `open` opens the popup while focus is
 * elsewhere. A picker popup that gets focus while the picker's own popup is
 * open is taken to be that popup. Focus that moves inside the popup keeps it
 * following, and so does focus that goes to no element (the window losing
 * focus): the next element to get focus decides. Focus that comes back to the
 * field (the popup hands it back when it closes) ends it without a report, the
 * field's own blur taking over.
 * @param getOpenField Returns the field's input root while the picker's
 * desktop popup is open, `null` otherwise
 * @param onLeave Called once focus arrives outside the field and the popup,
 * with the blur event to report
 * @returns The watch, listening to nothing yet
 */
const createPopupFocusWatch = (
	getOpenField: () => HTMLDivElement | null,
	onLeave: FocusHandler,
): PopupFocusWatch => {
	let watched: {
		field: HTMLDivElement;
		popup: Element;
		lastFocused: Element;
	} | null = null;

	const handleFocusIn = (event: FocusEvent) => {
		const next = event.target;
		if (!watched) {
			if (!(next instanceof Element)) return;
			const popup = next.closest(POPPER_ROOT_SELECTOR);
			const field = popup && getOpenField();
			if (popup && field) watched = { field, popup, lastFocused: next };
			return;
		}
		const { field, popup, lastFocused } = watched;
		if (next instanceof Element && popup.contains(next)) {
			watched.lastFocused = next;
			return;
		}
		watched = null;
		if (next instanceof Node && field.contains(next)) return;
		onLeave(popupBlurEvent(field, lastFocused, event));
	};

	return {
		listen: (doc) => {
			doc.addEventListener("focusin", handleFocusIn, true);
			return () => {
				doc.removeEventListener("focusin", handleFocusIn, true);
				watched = null;
			};
		},
	};
};

/**
 * A callback ref that hands the element to the field's own ref and to a ref
 * the caller set, each as React would hand it to that ref alone: a cleanup
 * the caller's callback returns runs on detach, otherwise the callback gets
 * `null`.
 * @param fieldRef The field's own ref
 * @param callerRef The caller's ref
 * @returns The ref to set on the element
 */
const forkFieldRef =
	(
		fieldRef: React.RefObject<HTMLDivElement | null>,
		callerRef: NonNullable<React.Ref<HTMLDivElement>>,
	): React.RefCallback<HTMLDivElement> =>
	(element) => {
		fieldRef.current = element;
		if (typeof callerRef !== "function") {
			callerRef.current = element;
			return () => {
				fieldRef.current = null;
				callerRef.current = null;
			};
		}
		const cleanup = callerRef(element);
		return () => {
			fieldRef.current = null;
			if (typeof cleanup === "function") cleanup();
			else callerRef(null);
		};
	};

/**
 * What {@link WithFieldBlur} needs besides the slot props
 */
export interface FieldBlurOptions {
	/**
	 * The picker's `name` prop. MUI passes it to the text field itself, so it is
	 * not among the slot props; a `name` in the slot props takes precedence, as
	 * in MUI.
	 */
	name?: string;
	/** Called whenever an element of the field gets focus */
	onFieldFocus?: () => void;
}

/**
 * Wires a picker's `textField` slot props so that the field's `onBlur` is
 * called once focus leaves the field, with an event that names the field. See
 * {@link useFieldBlur}.
 * @param ownerState The owner state the picker resolves the `textField` slot
 * props with, for whether its popup is open
 * @param textFieldProps The props for MUI's `textField` slot
 * @param options The field's name, and a focus callback
 * @returns The same props, with `onBlur` moved to the input root, the name as
 * the input root's `data-name`, `onFieldFocus` called from the input root, and
 * a ref on the input root
 */
export type WithFieldBlur = <P extends object>(
	ownerState: PickerOwnerState,
	textFieldProps: P,
	options?: FieldBlurOptions,
) => P;

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
 * That holds however the popup was opened: a controlled `open` that opens it
 * while focus is outside the field, too. When such a popup closes, it hands
 * focus back to the element that had it, which is leaving as well.
 * The mobile dialog is modal, so focus only leaves it by closing it.
 *
 * The handler receives the root's focus event: `currentTarget` is the input
 * root, `target` the section or button that lost focus. The input root carries
 * the field's name as `data-name` (unless the caller set one on it), so a
 * handler that reads the field from the event, as Form's `handleBlur` does,
 * finds it there; the name itself sits on the hidden input, which never has
 * focus. When focus leaves from
 * the popup, the event is made in that shape from the native `focusin` of the
 * element that got focus (`nativeEvent`): `target` is the element of the popup
 * that had focus, `relatedTarget` the element that got it. The `onBlur` of the
 * latest render is called. A blur handler the caller set on the input root
 * (`slotProps.input.slotProps.root.onBlur`) is kept and still sees every blur
 * of the root, and so is a ref the caller set there.
 *
 * `options.onFieldFocus`, if given, is called from the input root's focus, whenever
 * focus enters the field or moves within it; a focus handler the caller set on
 * the input root is kept.
 * @returns The function to resolve the `textField` slot props with, the same
 * for the life of the component
 */
const useFieldBlur = (): WithFieldBlur => {
	// focus that leaves from the popup is reported later, to the latest onBlur
	const onBlurRef = useRef<FocusHandler | undefined>(undefined);
	// the field's input root, and whether its desktop popup is open, as of the
	// latest render
	const fieldRef = useRef<HTMLDivElement | null>(null);
	const popupOpenRef = useRef(false);
	const [popupWatch] = useState(() =>
		createPopupFocusWatch(
			() => (popupOpenRef.current ? fieldRef.current : null),
			(event) => onBlurRef.current?.(event),
		),
	);
	useEffect(
		() => popupWatch.listen(fieldRef.current?.ownerDocument ?? document),
		[popupWatch],
	);
	// one ref per ref the caller set on the input root, so it stays the same
	const [forkedFieldRefs] = useState(
		() => new WeakMap<object, React.RefCallback<HTMLDivElement>>(),
	);

	return useCallback(
		<P extends object>(
			ownerState: PickerOwnerState,
			textFieldProps: P,
			options: FieldBlurOptions = {},
		): P => {
			const { onFieldFocus } = options;
			const {
				onBlur,
				slotProps: slotPropsProp,
				name = options.name,
			} = textFieldProps as TextFieldPropsWithBlur;
			onBlurRef.current = onBlur;
			popupOpenRef.current =
				ownerState.isPickerOpen && ownerState.pickerVariant !== "mobile";
			if (!onBlur && !onFieldFocus && !name) return textFieldProps;
			const slotProps = slotPropsProp ?? {};
			const input = slotProps.input ?? {};
			const root = input.slotProps?.root;
			const callerRef = root?.ref;
			let rootRef: React.Ref<HTMLDivElement> = fieldRef;
			if (callerRef) {
				rootRef =
					forkedFieldRefs.get(callerRef) ?? forkFieldRef(fieldRef, callerRef);
				forkedFieldRefs.set(callerRef, rootRef);
			}

			const handleRootBlur = (event: React.FocusEvent<HTMLDivElement>) => {
				root?.onBlur?.(event);
				if (!onBlur) return;
				const field = event.currentTarget;
				const next = event.relatedTarget;
				if (next instanceof Node && field.contains(next)) return;
				if (ownerState.isPickerOpen) {
					// the mobile dialog is modal: while it is open, focus can only go
					// into it, and it hands focus back to the field when it closes
					if (ownerState.pickerVariant === "mobile") return;
					// focus that goes into the open popup is followed from there, see
					// createPopupFocusWatch
					if (next?.closest(POPPER_ROOT_SELECTOR)) return;
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
								// names the field in the blur event, see useFieldBlur
								"data-name": name,
								...root,
								// the field the popup's focus watch reports for
								ref: rootRef,
								onBlur: handleRootBlur,
								...(onFieldFocus && {
									onFocus: (event: React.FocusEvent<HTMLDivElement>) => {
										root?.onFocus?.(event);
										onFieldFocus();
									},
								}),
							},
						},
					},
				},
			};
		},
		[forkedFieldRefs],
	);
};

export default useFieldBlur;
