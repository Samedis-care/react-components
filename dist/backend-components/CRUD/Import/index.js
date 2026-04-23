import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useState } from "react";
import { Button, Grid, Step, StepLabel, Stepper, styled } from "@mui/material";
import Step1LoadData from "./Step1LoadData";
import Step2ConnectData from "./Step2ConnectData";
import Step3ValidateReview from "./Step3ValidateReview";
import Step4Import from "./Step4Import";
import useCCTranslations from "../../../utils/useCCTranslations";
import { useCrudDispatchContext } from "../index";
export const IMPORT_STEPS = [
    "backend-components.crud.import.step1",
    "backend-components.crud.import.step2",
    "backend-components.crud.import.step3",
    "backend-components.crud.import.step4",
];
const Wrapper = styled(Grid, { name: "CcCrudImport", slot: "wrapper" })({
    width: "100%",
    height: "100%",
});
export const isFieldImportable = (name, field) => {
    const createVisibility = field.visibility.create;
    const editVisibility = field.visibility.edit;
    const visibilityOkay = typeof createVisibility === "function" ||
        typeof editVisibility === "function" ||
        (!createVisibility.disabled && !createVisibility.readOnly) ||
        (!editVisibility.disabled && !editVisibility.readOnly);
    // no images
    const typeOkay = field.type.getFilterType() !== null;
    return name !== "id" && visibilityOkay && typeOkay;
};
export const useCrudImportLogic = (props) => {
    const { model, importConfig, updateKey } = props;
    const guided = props.guided && importConfig;
    const crudCtx = useCrudDispatchContext();
    if (updateKey && !model.fields[updateKey]?.filterable) {
        throw new Error("Update key not in model or not filterable");
    }
    const [activeStep, setActiveStep] = useState(0);
    const [state, setState] = useState({
        files: [],
        data: [],
        conversionScripts: importConfig
            ? Object.fromEntries(Object.entries(importConfig).map(([field, scriptFn]) => [
                field,
                {
                    scriptFn,
                    status: "pending",
                    error: null,
                },
            ]))
            : {},
        validationPassed: false,
        importDone: false,
    });
    const hasImportConfig = !!importConfig;
    const next = useCallback(() => setActiveStep((prev) => prev + (prev == 0 && guided ? 2 : 1)), [guided]);
    const prev = useCallback(() => setActiveStep((prev) => prev - (prev == 2 && guided ? 2 : 1)), [guided]);
    const finish = useCallback(() => {
        crudCtx.showOverview(true);
    }, [crudCtx]);
    return {
        guided,
        activeStep,
        state,
        setState,
        hasImportConfig,
        next,
        prev,
        finish,
    };
};
const CrudImport = (props) => {
    const { t } = useCCTranslations();
    const { updateKeyAdditionalFilters, howTo, model, updateKey, validate } = props;
    const { guided, activeStep, state, setState, hasImportConfig, next, prev, finish, } = useCrudImportLogic(props);
    return (_jsxs(Wrapper, { container: true, sx: {
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "stretch",
        }, spacing: 2, wrap: "nowrap", children: [_jsx(Grid, { children: _jsx(Stepper, { activeStep: guided && activeStep > 1 ? activeStep - 1 : activeStep, children: IMPORT_STEPS.filter((label, index) => !(guided && index === 1)).map((label, index) => (_jsx(Step, { children: _jsx(StepLabel, { children: t(label) }) }, index.toString(16)))) }) }), _jsxs(Grid, { size: "grow", children: [activeStep === 0 && (_jsx(Step1LoadData, { model: model, howTo: guided ? howTo : undefined, updateKey: updateKey, additionalUpdateKeyFilters: updateKeyAdditionalFilters, hasImportConfig: hasImportConfig, validate: validate, state: state, setState: setState })), activeStep === 1 && (_jsx(Step2ConnectData, { model: model, updateKey: updateKey, additionalUpdateKeyFilters: updateKeyAdditionalFilters, hasImportConfig: hasImportConfig, validate: validate, state: state, setState: setState })), activeStep === 2 && (_jsx(Step3ValidateReview, { model: model, updateKey: updateKey, additionalUpdateKeyFilters: updateKeyAdditionalFilters, hasImportConfig: hasImportConfig, validate: validate, state: state, setState: setState })), activeStep === 3 && (_jsx(Step4Import, { model: model, updateKey: updateKey, additionalUpdateKeyFilters: updateKeyAdditionalFilters, hasImportConfig: hasImportConfig, validate: validate, state: state, setState: setState }))] }), _jsx(Grid, { children: _jsxs(Grid, { container: true, spacing: 2, children: [activeStep !== 3 && (_jsx(Grid, { children: _jsx(Button, { variant: "contained", disabled: activeStep === 0 || activeStep >= 3, onClick: prev, children: t("common.buttons.back") }) })), _jsx(Grid, { children: _jsx(Button, { variant: "contained", disabled: (activeStep === 0 && state.files.length === 0) ||
                                    (activeStep === 2 && !state.validationPassed) ||
                                    (activeStep === 3 && !state.importDone), onClick: activeStep === 3 ? finish : next, children: activeStep === 3
                                    ? t("common.buttons.finish")
                                    : t("common.buttons.next") }) })] }) })] }));
};
export default React.memo(CrudImport);
