import React, { useEffect, useMemo } from "react";
import { useFormContext } from "./Form";
import debounce from "../../utils/debounce";
/**
 * Helper to implement auto save in forms
 * @param debounceTime The debounce time (time between changes for save to trigger)
 */
const useFormAutoSave = (debounceTime = 5000) => {
    const { submit, submitting, dirty, values } = useFormContext();
    const debounceSubmit = useMemo(() => (debounceTime == 0 ? submit : debounce(submit, debounceTime)), [submit, debounceTime]);
    const dataStr = JSON.stringify(values);
    useEffect(() => {
        if (!dirty || submitting)
            return;
        debounceSubmit();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataStr]);
};
const FormAutoSave = (props) => {
    useFormAutoSave(props.debounceTime);
    return React.createElement(React.Fragment, null);
};
export default React.memo(FormAutoSave);
