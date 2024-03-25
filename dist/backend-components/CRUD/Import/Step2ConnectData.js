import React, { useCallback, useMemo, useRef } from "react";
import { isFieldImportable } from "./index";
import { Box, Card, CardContent, CircularProgress, Grid, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography, styled, } from "@mui/material";
import { Check as CheckIcon, ErrorOutline as ErrorIcon, HelpOutline as UnknownIcon, } from "@mui/icons-material";
import uniqueArray from "../../../utils/uniqueArray";
import debouncePromise from "../../../utils/debouncePromise";
import useCCTranslations from "../../../utils/useCCTranslations";
const ScriptInput = styled(TextField, {
    name: "CcCrudImportStep2",
    slot: "ScriptInput",
})({
    "& textarea": {
        fontFamily: "monospace",
    },
});
const MonoTableCell = styled(TableCell, {
    name: "CcCrudImportStep2",
    slot: "MonoTableCell",
})({
    fontFamily: "monospace",
});
const StyledCardContent = styled(CardContent, {
    name: "CcCrudImportStep2",
    slot: "CardContent",
})({
    paddingBottom: 4,
    "&:last-child": {
        paddingBottom: 4,
    },
});
export const useImportStep2Logic = (props) => {
    const { model, state, setState } = props;
    const { t } = useCCTranslations();
    const columns = useMemo(() => uniqueArray(state.data.map(Object.keys).flat()), [state.data]);
    const conversionScriptUpdates = useRef(Object.fromEntries(Object.keys(model.fields).map((key) => [
        key,
        debouncePromise(async (data, field, script) => {
            for (const record of data) {
                // eslint-disable-next-line no-eval
                const result = eval(script) ?? null; // ensure this is never undefined
                let validation = null;
                switch (field.type.getFilterType()) {
                    case "enum":
                    case "string":
                        if (result != null && typeof result !== "string") {
                            validation = t("backend-components.crud.import.validations.string");
                        }
                        break;
                    case "number":
                        if (result != null && typeof result !== "number") {
                            validation = t("backend-components.crud.import.validations.number");
                        }
                        break;
                    case "currency":
                        if (result !== null)
                            validation = t("backend-components.crud.import.validations.currency_unsupported");
                        break;
                    case "date":
                        if (result !== null && !(result instanceof Date)) {
                            validation = t("backend-components.crud.import.validations.date");
                        }
                        break;
                    case "boolean":
                        if (result !== true && result !== false && result !== null) {
                            validation = t("backend-components.crud.import.validations.boolean");
                        }
                        break;
                }
                if (!validation) {
                    // if type checks have passed, call field type validator
                    validation = await field.type.validate(result);
                }
                if (validation) {
                    // eslint-disable-next-line no-console
                    console.error("Validation failed:", validation, "; Result =", result, "; Record =", record);
                    throw new Error(t("backend-components.crud.import.validations.fail", {
                        REASON: validation,
                    }));
                }
            }
        }, 1000),
    ])));
    const handleConversionScriptChange = useCallback(async (evt) => {
        setState((prev) => ({
            ...prev,
            conversionScripts: {
                ...prev.conversionScripts,
                [evt.target.name]: {
                    script: evt.target.value,
                    status: "pending",
                    error: null,
                },
            },
        }));
        try {
            await conversionScriptUpdates.current[evt.target.name](state.data, model.fields[evt.target.name], evt.target.value);
            setState((prev) => ({
                ...prev,
                conversionScripts: {
                    ...prev.conversionScripts,
                    [evt.target.name]: {
                        ...prev.conversionScripts[evt.target.name],
                        status: "okay",
                        error: null,
                    },
                },
            }));
        }
        catch (e) {
            setState((prev) => ({
                ...prev,
                conversionScripts: {
                    ...prev.conversionScripts,
                    [evt.target.name]: {
                        ...prev.conversionScripts[evt.target.name],
                        status: "error",
                        error: e,
                    },
                },
            }));
        }
    }, [model.fields, setState, state.data]);
    return { columns, conversionScriptUpdates, handleConversionScriptChange };
};
const Step2ConnectData = (props) => {
    const { model, state } = props;
    const { t } = useCCTranslations();
    const { columns, handleConversionScriptChange } = useImportStep2Logic(props);
    return (React.createElement(Grid, { container: true, spacing: 2 },
        React.createElement(Grid, { item: true, xs: 6 },
            React.createElement(Box, { mb: 2 },
                React.createElement(Typography, { variant: "h5" }, t("backend-components.crud.import.source_fields"))),
            React.createElement(Table, null,
                React.createElement(TableHead, null,
                    React.createElement(TableRow, null,
                        React.createElement(TableCell, null, t("backend-components.crud.import.source_field")),
                        React.createElement(TableCell, null, t("backend-components.crud.import.source_field_type")))),
                React.createElement(TableBody, null, columns.map((column) => {
                    const dataTypes = uniqueArray(state.data.map((record) => typeof record[column])).sort();
                    return (React.createElement(TableRow, { key: column },
                        React.createElement(MonoTableCell, null, `record["${column}"]`),
                        React.createElement(TableCell, null, dataTypes.join(", "))));
                })))),
        React.createElement(Grid, { item: true, xs: 6 },
            React.createElement(Box, { mb: 2 },
                React.createElement(Typography, { variant: "h5" }, t("backend-components.crud.import.destination_fields"))),
            React.createElement(Grid, { container: true, spacing: 2 }, Object.entries(model.fields)
                .filter(([name, field]) => isFieldImportable(name, field))
                .map(([name, field]) => {
                const convScript = state.conversionScripts[name];
                return (React.createElement(Grid, { item: true, xs: 12, key: name },
                    React.createElement(Card, null,
                        React.createElement(StyledCardContent, null,
                            React.createElement(Grid, { container: true, justifyContent: "space-between" },
                                React.createElement(Grid, { item: true },
                                    React.createElement(Typography, null, field.getLabel()
                                        ? `${field.getLabel()} (${name})`
                                        : name),
                                    React.createElement(Typography, { color: "textSecondary" }, field.type.getFilterType())),
                                React.createElement(Grid, { item: true },
                                    React.createElement(Tooltip, { title: convScript
                                            ? convScript.error?.toString() ?? ""
                                            : t("backend-components.crud.import.validations.unknown") ?? "" }, convScript ? (convScript.status === "okay" ? (React.createElement(CheckIcon, null)) : convScript.status === "pending" ? (React.createElement(CircularProgress, null)) : convScript.status === "error" ? (React.createElement(ErrorIcon, null)) : (React.createElement(UnknownIcon, null))) : (
                                    // unknown status
                                    React.createElement(UnknownIcon, null))))),
                            React.createElement(Grid, { item: true, xs: 12 },
                                React.createElement(Box, { mt: 2 },
                                    convScript?.error && (React.createElement(Typography, null, convScript.error.toString())),
                                    React.createElement(ScriptInput, { multiline: true, label: t("backend-components.crud.import.conv_script"), name: name, value: convScript?.script ?? "", onChange: handleConversionScriptChange, placeholder: `${name} = `, fullWidth: true })))))));
            })))));
};
export default React.memo(Step2ConnectData);
