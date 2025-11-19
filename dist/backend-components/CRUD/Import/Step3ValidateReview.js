import React, { useEffect, useMemo } from "react";
import { isFieldImportable } from "./index";
import GenericDataPreview from "./GenericDataPreview";
import deepAssign from "../../../utils/deepAssign";
import { dotToObject } from "../../../utils/dotUtils";
import isObjectEmpty from "../../../utils/isObjectEmpty";
import useAsyncMemo from "../../../utils/useAsyncMemo";
import useCCTranslations from "../../../utils/useCCTranslations";
import { Loader } from "../../../standalone";
export const useImportStep3Logic = (props) => {
    const { model, state, setState, validate } = props;
    const { t } = useCCTranslations();
    const records = useAsyncMemo(() => Promise.all(state.data.map(async (record) => {
        const modelRecord = {};
        let isModelRecordComplete = false;
        try {
            Object.entries(model.fields)
                .filter(([name, field]) => isFieldImportable(name, field) &&
                state.conversionScripts[name]?.scriptFn(record))
                .forEach(([name]) => {
                deepAssign(modelRecord, dotToObject(name, state.conversionScripts[name].scriptFn(record) ?? null));
            });
            // noinspection JSUnusedAssignment
            isModelRecordComplete = true;
            const validation = await model.validate(modelRecord);
            return [
                modelRecord,
                validate
                    ? { ...(await validate(modelRecord)), ...validation }
                    : validation,
                null,
            ];
        }
        catch (e) {
            return [
                isModelRecordComplete ? modelRecord : record,
                {},
                e,
            ];
        }
    })), [model, state.conversionScripts, state.data]);
    const recordsNormalized = useMemo(() => (records ?? []).map((record) => {
        const [data, validation, error] = record;
        // verify that update key is unique in our import data set, otherwise we might create multiple records with the same update key
        const updateKey = props.updateKey;
        if (updateKey && !(updateKey in validation) && data[updateKey]) {
            const recordsWithUpdateKey = (records ?? []).filter((r) => r[0][updateKey] === data[updateKey]);
            if (recordsWithUpdateKey.length > 1) {
                validation[updateKey] = t("backend-components.crud.import.errors.update-key-not-uniq", {
                    UPDATE_KEY: model.fields[updateKey].getLabel(),
                });
            }
        }
        return {
            validation_errors: isObjectEmpty(validation)
                ? "-"
                : Object.entries(validation)
                    .map(([name, error]) => model.fields[name].getLabel() + ": " + error)
                    .join("; "),
            conversion_errors: error?.toString() ?? "-",
            ...data,
        };
    }), [model.fields, props.updateKey, records, t]);
    const everythingOkay = useMemo(() => records
        ? !records.find((record) => !isObjectEmpty(record[1]) || record[2])
        : false, [records]);
    useEffect(() => {
        setState((prev) => ({
            ...prev,
            validationPassed: everythingOkay,
        }));
    }, [setState, everythingOkay]);
    return {
        records,
        recordsNormalized,
        everythingOkay,
    };
};
const Step3ValidateReview = (props) => {
    const { model } = props;
    const { records, recordsNormalized, everythingOkay } = useImportStep3Logic(props);
    const { t } = useCCTranslations();
    if (!records)
        return React.createElement(Loader, null);
    return (React.createElement(GenericDataPreview, { model: model, data: recordsNormalized, existingDefinition: [
            ...model.toDataGridColumnDefinition().map((columnDef) => ({
                ...columnDef,
                filterable: true,
                sortable: true,
                isLocked: false,
                hidden: false,
            })),
            {
                field: "validation_errors",
                type: "string",
                headerName: t("backend-components.crud.import.validation_errors"),
                filterable: true,
                sortable: true,
                isLocked: false,
                hidden: false,
            },
            {
                field: "conversion_errors",
                type: "string",
                headerName: t("backend-components.crud.import.conversion_errors"),
                filterable: true,
                sortable: true,
                isLocked: false,
                hidden: false,
            },
        ], defaultFilter: everythingOkay
            ? []
            : [
                {
                    field: "validation_errors",
                    filter: {
                        type: "notEqual",
                        value1: "-",
                        value2: "",
                    },
                },
            ] }));
};
export default React.memo(Step3ValidateReview);
