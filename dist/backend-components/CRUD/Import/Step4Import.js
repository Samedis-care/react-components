import React, { useEffect, useState } from "react";
import { isFieldImportable } from "./index";
import { Grid, TextField, Typography } from "@mui/material";
import { Model, ModelVisibilityHidden, useModelMutation, } from "../../../backend-integration";
import { deepAssign, dotToObject, getValueByDot, sleep } from "../../../utils";
import useCCTranslations from "../../../utils/useCCTranslations";
export const useImportStep4Logic = (props) => {
    const { model, state, setState, updateKey, additionalUpdateKeyFilters } = props;
    // model which can write to all fields
    const customModel = new Model(model.modelId, Object.fromEntries(Object.entries(model.fields).map(([key, field]) => [
        key,
        {
            ...field,
            visibility: {
                ...field.visibility,
                create: ModelVisibilityHidden,
            },
        },
    ])), model.connector, model.cacheKeys, model.options);
    const { mutateAsync: createOrUpdateRecord } = useModelMutation(customModel);
    const [importDone, setImportDone] = useState(false);
    useEffect(() => {
        setState((prev) => ({
            ...prev,
            importDone,
        }));
    }, [setState, importDone]);
    const [counters, setCounters] = useState({
        todo: 0,
        success: 0,
        failed: 0,
    });
    const [lastError, setLastError] = useState("");
    useEffect(() => {
        void (async () => {
            setCounters({
                todo: state.data.length,
                success: 0,
                failed: 0,
            });
            let activeRequests = 0;
            await Promise.all(state.data.map(async (record) => {
                // limit to 10 concurrent requests
                while (activeRequests >= 10)
                    await sleep(50);
                activeRequests++;
                const modelRecord = {};
                try {
                    Object.entries(model.fields)
                        .filter(([name, field]) => isFieldImportable(name, field))
                        .forEach(([name]) => {
                        deepAssign(modelRecord, dotToObject(name, 
                        // eslint-disable-next-line no-eval
                        eval(state.conversionScripts[name]?.script ?? "") ?? null));
                    });
                    if (updateKey) {
                        const filterKey = model.fields[updateKey].type.stringify(getValueByDot(updateKey, modelRecord));
                        if (filterKey) {
                            const [records, meta] = await model.index({
                                rows: 2,
                                page: 1,
                                fieldFilter: {
                                    [updateKey]: {
                                        type: "equals",
                                        value1: filterKey,
                                        value2: "",
                                    },
                                },
                                additionalFilters: additionalUpdateKeyFilters,
                            });
                            const rows = meta.filteredRows ?? meta.totalRows;
                            if (rows == 1) {
                                modelRecord.id = records[0].id;
                            }
                            else if (rows >= 2) {
                                throw new Error("Update key not unique: " + filterKey);
                            }
                        }
                    }
                    await createOrUpdateRecord(modelRecord);
                    setCounters((prev) => ({
                        ...prev,
                        success: prev.success + 1,
                    }));
                }
                catch (e) {
                    // eslint-disable-next-line no-console
                    console.error(e);
                    setCounters((prev) => ({
                        ...prev,
                        failed: prev.failed + 1,
                    }));
                    // only single entry in error log for readability and performance (error spam => massive slowdown)
                    setLastError(JSON.stringify({
                        error: e.toString(),
                        destRecord: modelRecord,
                        sourceRecord: record,
                    }, undefined, 4));
                }
                finally {
                    setCounters((prev) => ({
                        ...prev,
                        todo: prev.todo - 1,
                    }));
                    activeRequests--;
                }
            }));
            setImportDone(true);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return { counters, lastError };
};
const Step4Import = (props) => {
    const { counters, lastError } = useImportStep4Logic(props);
    const { t } = useCCTranslations();
    return (React.createElement(Grid, { container: true, spacing: 2 },
        React.createElement(Grid, { item: true, xs: 12 },
            React.createElement(Typography, null, t("backend-components.crud.import.queue", { COUNT: counters.todo }))),
        React.createElement(Grid, { item: true, xs: 12 },
            React.createElement(Typography, null, t("backend-components.crud.import.success", {
                COUNT: counters.success,
            }))),
        React.createElement(Grid, { item: true, xs: 12 },
            React.createElement(Typography, null, t("backend-components.crud.import.failed", {
                COUNT: counters.failed,
            }))),
        React.createElement(Grid, { item: true, xs: 12 },
            React.createElement(TextField, { multiline: true, fullWidth: true, label: t("backend-components.crud.import.last_error"), value: lastError }))));
};
export default React.memo(Step4Import);
