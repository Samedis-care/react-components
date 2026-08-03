import React, { useEffect, useMemo } from "react";
import { useFormContext } from "./Form";
import debounce from "../../utils/debounce";

export interface FormAutoSaveProps {
	debounceTime?: number;
}

/**
 * Helper to implement auto save in forms
 * @param debounceTime The debounce time (time between changes for save to trigger)
 */
const useFormAutoSave = (debounceTime = 5000) => {
	const { safeSubmit, submitting, dirty, values } = useFormContext();
	const debounceSubmit = useMemo(
		() => (debounceTime == 0 ? safeSubmit : debounce(safeSubmit, debounceTime)),
		[safeSubmit, debounceTime],
	);
	const dataStr = JSON.stringify(values);
	useEffect(() => {
		if (!dirty || submitting) return;
		void debounceSubmit();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dataStr]);
};

const FormAutoSave = (props: FormAutoSaveProps) => {
	useFormAutoSave(props.debounceTime);
	return <React.Fragment />;
};

export default React.memo(FormAutoSave);
