import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useId, useMemo, useRef } from "react";
import { isFieldImportable, } from "./index";
import { Box, Card, CardContent, CircularProgress, Grid, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography, styled, } from "@mui/material";
import { Check as CheckIcon, ErrorOutlined as ErrorIcon, HelpOutlined as UnknownIcon, } from "@mui/icons-material";
import uniqueArray from "../../../utils/uniqueArray";
import debouncePromise from "../../../utils/debouncePromise";
import useCCTranslations from "../../../utils/useCCTranslations";
const ScriptInput = styled(TextField, {
    name: "CcCrudImportStep2",
    slot: "scriptInput",
})({
    "& textarea": {
        fontFamily: "monospace",
    },
});
const MonoTableCell = styled(TableCell, {
    name: "CcCrudImportStep2",
    slot: "monoTableCell",
})({
    fontFamily: "monospace",
});
const StyledCardContent = styled(CardContent, {
    name: "CcCrudImportStep2",
    slot: "cardContent",
})({
    paddingBottom: 4,
    "&:last-child": {
        paddingBottom: 4,
    },
});
const StatusText = styled("span", {
    name: "CcCrudImportStep2",
    slot: "statusText",
})({
    // visually hidden, as MUI's visuallyHidden
    border: 0,
    clipPath: "inset(50%)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    whiteSpace: "nowrap",
    width: 1,
});
/**
 * The text of each state of a script's check (no script yet, being checked, passed, failed)
 */
const STATUS_TEXT_KEYS = {
    none: "backend-components.crud.import.script_status.none",
    pending: "backend-components.crud.import.script_status.pending",
    okay: "backend-components.crud.import.script_status.okay",
    error: "backend-components.crud.import.script_status.error",
};
/**
 * The values an enum field takes, as a conversion script has to return them: each value as
 * a string literal, followed by its label when that differs (`"eng" (Engineering)`).
 * Dividers and invisible values are left out, as in the field's own selector.
 * @param values The enum type's values
 * @returns The values joined with ", ", or "" when none is left
 */
const formatEnumValues = (values) => values
    .filter((entry) => !entry.isDivider && !entry.invisible)
    .map((entry) => {
    const literal = JSON.stringify(entry.value);
    const label = entry.getLabel();
    return label && label !== entry.value ? `${literal} (${label})` : literal;
})
    .join(", ");
export const useImportStep2Logic = (props) => {
    const { model, state, setState } = props;
    const { t } = useCCTranslations();
    const columns = useMemo(() => uniqueArray(state.data.map(Object.keys).flat()), [state.data]);
    const conversionScriptUpdates = useRef(Object.fromEntries(Object.keys(model.fields).map((key) => [
        key,
        debouncePromise(async (data, field, scriptFn) => {
            for (const record of data) {
                const result = scriptFn(record) ?? null; // ensure this is never undefined
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
                    validation = await field.type.validate(result, field);
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
        const script = evt.target.value;
        // this eval is used for developer input excel data => JS data conversion. it is not intended for end user usage
        // record param needs to have this name for eval
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const scriptFn = (record) => {
            // eslint-disable-next-line no-eval
            return eval(script);
        };
        setState((prev) => ({
            ...prev,
            conversionScripts: {
                ...prev.conversionScripts,
                [evt.target.name]: {
                    script: evt.target.value,
                    scriptFn,
                    status: "pending",
                    error: null,
                },
            },
        }));
        try {
            await conversionScriptUpdates.current[evt.target.name](state.data, model.fields[evt.target.name], scriptFn);
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
    const idPrefix = useId();
    return (_jsxs(Grid, { container: true, spacing: 2, children: [_jsxs(Grid, { size: 6, children: [_jsx(Box, { sx: { mb: 2 }, children: _jsx(Typography, { variant: "h5", children: t("backend-components.crud.import.source_fields") }) }), _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: t("backend-components.crud.import.source_field") }), _jsx(TableCell, { children: t("backend-components.crud.import.source_field_type") })] }) }), _jsx(TableBody, { children: columns.map((column) => {
                                    const dataTypes = uniqueArray(state.data.map((record) => typeof record[column])).sort();
                                    return (_jsxs(TableRow, { children: [_jsx(MonoTableCell, { children: `record["${column}"]` }), _jsx(TableCell, { children: dataTypes.join(", ") })] }, column));
                                }) })] })] }), _jsxs(Grid, { size: 6, children: [_jsx(Box, { sx: { mb: 2 }, children: _jsx(Typography, { variant: "h5", children: t("backend-components.crud.import.destination_fields") }) }), _jsx(Grid, { container: true, spacing: 2, children: Object.entries(model.fields)
                            .filter(([name, field]) => isFieldImportable(name, field))
                            .map(([name, field], index) => {
                            const convScript = state.conversionScripts[name];
                            const fieldLabel = field.getLabel() || name;
                            const scriptId = `${idPrefix}-script-${index}`;
                            const typeId = `${idPrefix}-type-${index}`;
                            const valuesId = `${idPrefix}-values-${index}`;
                            const enumValues = field.type.getEnumValues
                                ? formatEnumValues(field.type.getEnumValues())
                                : "";
                            const statusText = t(STATUS_TEXT_KEYS[convScript?.status ?? "none"], { FIELD: fieldLabel });
                            const failed = convScript?.status === "error";
                            const errorText = failed
                                ? convScript.error?.toString()
                                : undefined;
                            // the error (MUI's helper text id), then the expected type
                            const describedBy = [
                                errorText ? `${scriptId}-helper-text` : null,
                                typeId,
                                enumValues ? valuesId : null,
                            ]
                                .filter(Boolean)
                                .join(" ");
                            return (_jsx(Grid, { size: 12, children: _jsx(Card, { children: _jsxs(StyledCardContent, { children: [_jsxs(Grid, { container: true, sx: { justifyContent: "space-between" }, children: [_jsxs(Grid, { size: "grow", children: [_jsx(Typography, { children: field.getLabel()
                                                                    ? `${field.getLabel()} (${name})`
                                                                    : name }), _jsx(Typography, { color: "textSecondary", id: typeId, children: field.type.getFilterType() }), enumValues && (_jsx(Typography, { color: "textSecondary", variant: "body2", id: valuesId, children: enumValues }))] }), _jsxs(Grid, { children: [_jsx(Tooltip, { title: statusText, children: convScript ? (convScript.status === "okay" ? (_jsx(CheckIcon, {})) : convScript.status === "pending" ? (_jsx(CircularProgress, { "aria-hidden": true })) : convScript.status === "error" ? (_jsx(ErrorIcon, {})) : (_jsx(UnknownIcon, {}))) : (_jsx(UnknownIcon, {})) }), _jsx(StatusText, { role: "status", children: statusText })] })] }), _jsx(Grid, { size: 12, children: _jsx(Box, { sx: { mt: 2 }, children: _jsx(ScriptInput, { multiline: true, id: scriptId, label: t("backend-components.crud.import.conv_script", { FIELD: fieldLabel }), name: name, value: convScript?.script ?? "", onChange: handleConversionScriptChange, placeholder: `${name} = `, fullWidth: true, error: failed, helperText: errorText, slotProps: {
                                                            htmlInput: {
                                                                "aria-describedby": describedBy,
                                                            },
                                                        } }) }) })] }) }) }, name));
                        }) })] })] }));
};
export default React.memo(Step2ConnectData);
