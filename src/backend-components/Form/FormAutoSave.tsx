import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useFormContext } from "./Form";
import debounce from "../../utils/debounce";
import toComparisonJson from "../../utils/toComparisonJson";
import { ModelUnknown } from "../../backend-integration";

export interface FormAutoSaveProps {
	/**
	 * Milliseconds without a change of the values before the form is saved. A wait that
	 * ends while the form is busy starts over once it is idle again.
	 * @default 5000; 0 saves on every change, without waiting (once the form is idle)
	 */
	debounceTime?: number;
}

/**
 * Helper to implement auto save in forms
 * @param debounceTime The debounce time (time between changes for save to trigger)
 */
const useFormAutoSave = (debounceTime = 5000) => {
	const { safeSubmit, submitting, dirty, values } =
		useFormContext<ModelUnknown>();
	const dataStr = toComparisonJson(values);
	// the values of the last save started here, kept until the form is clean and idle again:
	// a save that failed is not started again for the same values (looking again on idle
	// would repeat it in a loop), the next change is saved
	const triedRef = useRef<string | null>(null);
	// a save that comes due while the form is busy waits: the effect below starts it again
	// once the form is idle
	const submittingRef = useRef(submitting);
	submittingRef.current = submitting;
	const save = useCallback(
		(data: string) => {
			if (submittingRef.current) return;
			triedRef.current = data;
			void safeSubmit();
		},
		[safeSubmit],
	);
	const debouncedSave = useMemo(
		() => (debounceTime == 0 ? null : debounce(save, debounceTime)),
		[save, debounceTime],
	);
	// a save still waiting for the pause belongs to this mount and this debounceTime: it is
	// dropped when the form unmounts (the user may have left and discarded the change), and
	// when debounceTime changes, where the effect below waits for the new time instead
	useEffect(() => () => debouncedSave?.cancel(), [debouncedSave]);
	// looks again whenever the values change, and when the form turns dirty (a custom field,
	// whose values are not the form's) or idle (a change made while it was busy)
	useEffect(() => {
		if (!dirty && !submitting) triedRef.current = null;
		if (!dirty || submitting || dataStr === triedRef.current) {
			debouncedSave?.cancel();
			return;
		}
		if (debouncedSave) debouncedSave(dataStr);
		else save(dataStr);
	}, [dataStr, dirty, submitting, debouncedSave, save]);
};

/**
 * Saves the form (safeSubmit) once it is dirty and idle and its values have not changed for
 * debounceTime milliseconds. Renders nothing: put it anywhere in the form's page.
 * @remarks A change made while the form is busy (a busy reason, or a save in progress) is
 *          saved once the form is idle again. A form that turns dirty without a change of
 *          its values (setCustomFieldDirty, e.g. a nested form or a queued upload) is saved
 *          too.
 * @remarks A save that failed is not started again for the same values: the next change is
 *          saved.
 * @remarks A save still waiting for the pause does not run once the form has unmounted.
 *          When debounceTime changes, it waits for the new time.
 */
const FormAutoSave = (props: FormAutoSaveProps) => {
	useFormAutoSave(props.debounceTime);
	return <React.Fragment />;
};

export default React.memo(FormAutoSave);
