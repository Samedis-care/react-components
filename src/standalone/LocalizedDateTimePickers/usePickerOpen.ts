import { useCallback, useEffect, useRef, useState } from "react";

/** The picker props {@link usePickerOpen} reads, and what it calls */
export interface PickerOpenProps {
	/**
	 * The caller's `open`: whether the calendar is open, or `undefined` to
	 * leave that to the picker
	 */
	open?: boolean;
	/** Called when the picker asks to open the calendar */
	onOpen?: () => void;
	/** Called when the picker asks to close the calendar, and when it closes it */
	onClose?: () => void;
	/**
	 * Called when the picker closes the open calendar because it got disabled
	 * or read-only, right before `onClose`: to keep and report the date picked
	 * in it, as when a click outside closes the calendar
	 */
	onDismiss?: () => void;
	/** The picker's `disabled` */
	disabled?: boolean;
	/** The picker's `readOnly` */
	readOnly?: boolean;
}

/** The open state to hand to MUI's picker */
export interface PickerOpenResult {
	/** Whether the calendar is open, as the picker's controlled `open` */
	open: boolean;
	/** The picker's `onOpen` */
	onOpen: () => void;
	/** The picker's `onClose` */
	onClose: () => void;
}

/**
 * Controls whether a picker's calendar (the desktop popup or the mobile
 * dialog) is open, so that it closes when the picker gets disabled or
 * read-only.
 *
 * MUI's picker does not open its calendar while `disabled` or `readOnly` is
 * set, but leaves one open that was open when either turned on, with every
 * day in it disabled: a layer that picks nothing until Escape or a click
 * outside closes it. A form that turns read-only while the user has the
 * calendar open gets there. With this hook the calendar is closed while
 * either is set. One that was open closes as a click outside closes it:
 * `onDismiss`, which keeps the date picked in it, then `onClose`. It stays
 * closed when both are off again.
 *
 * Without a caller's `open` the hook keeps the open state itself, from the
 * picker's `onOpen` and `onClose`. A caller's `open` decides it otherwise, and
 * the calendar shows only while the picker is neither disabled nor read-only;
 * the call to `onClose` lets the caller close it for good. The picker is
 * controlled either way, so MUI never sees `open` switch between `undefined`
 * and a boolean.
 * @param props The picker's props and the dismiss handler, see
 * {@link PickerOpenProps}. The latest `onOpen`, `onClose` and `onDismiss` are
 * called.
 * @returns The `open`, `onOpen` and `onClose` to hand to MUI's picker
 */
const usePickerOpen = (props: PickerOpenProps): PickerOpenResult => {
	const {
		open: openProp,
		onOpen,
		onClose,
		onDismiss,
		disabled,
		readOnly,
	} = props;
	const [ownOpen, setOwnOpen] = useState(false);
	const locked = !!disabled || !!readOnly;
	const open = (openProp ?? ownOpen) && !locked;

	const onOpenRef = useRef(onOpen);
	onOpenRef.current = onOpen;
	const onCloseRef = useRef(onClose);
	onCloseRef.current = onClose;
	const onDismissRef = useRef(onDismiss);
	onDismissRef.current = onDismiss;

	const handleOpen = useCallback(() => {
		setOwnOpen(true);
		onOpenRef.current?.();
	}, []);
	const handleClose = useCallback(() => {
		setOwnOpen(false);
		onCloseRef.current?.();
	}, []);

	// whether the calendar showed as of the last commit, to tell a calendar
	// the picker closed by getting disabled from one that was closed already
	const shownRef = useRef(open);
	useEffect(() => {
		const wasShown = shownRef.current;
		shownRef.current = open;
		if (!locked || !wasShown) return;
		setOwnOpen(false);
		onDismissRef.current?.();
		onCloseRef.current?.();
	}, [open, locked]);

	return { open, onOpen: handleOpen, onClose: handleClose };
};

export default usePickerOpen;
