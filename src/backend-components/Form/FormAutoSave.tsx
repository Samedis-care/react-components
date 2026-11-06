import React, { useEffect, useMemo } from "react";
import { useFormContext } from "./Form";
import debounce from "../../utils/debounce";
import toComparisonJson from "../../utils/toComparisonJson";
import { ModelUnknown } from "../../backend-integration";

export interface FormAutoSaveProps {
	/**
	 * Milliseconds without a change of the values before the form is saved
	 * @default 5000; 0 saves on every change, without waiting
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
	const debouncedSubmit = useMemo(
		() => (debounceTime == 0 ? null : debounce(safeSubmit, debounceTime)),
		[safeSubmit, debounceTime],
	);
	// a save still waiting for the pause belongs to this mount and this debounceTime: it is
	// dropped when the form unmounts (the user may have left and discarded the change), and
	// when debounceTime changes, where the effect below waits for the new time instead
	useEffect(() => () => debouncedSubmit?.cancel(), [debouncedSubmit]);
	const dataStr = toComparisonJson(values);
	useEffect(() => {
		if (!dirty || submitting) return;
		if (debouncedSubmit) debouncedSubmit();
		else void safeSubmit();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dataStr, debouncedSubmit]);
};

/**
 * Saves the form (safeSubmit) once its values have not changed for debounceTime
 * milliseconds. Renders nothing: put it anywhere in the form's page.
 * @remarks A save still waiting for the pause does not run once the form has unmounted.
 *          When debounceTime changes, it waits for the new time.
 */
const FormAutoSave = (props: FormAutoSaveProps) => {
	useFormAutoSave(props.debounceTime);
	return <React.Fragment />;
};

export default React.memo(FormAutoSave);
