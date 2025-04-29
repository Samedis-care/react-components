import React, { useCallback, useState } from "react";
import { Button, Grid, Step, StepLabel, Stepper, styled } from "@mui/material";
import Step1LoadData from "./Step1LoadData";
import Step2ConnectData from "./Step2ConnectData";
import Step3ValidateReview from "./Step3ValidateReview";
import Step4Import from "./Step4Import";
import { FrameworkHistory } from "../../../framework";
import useCCTranslations from "../../../utils/useCCTranslations";
import useLocation from "../../../standalone/Routes/useLocation";
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
    const { pathname } = useLocation();
    if (updateKey && !model.fields[updateKey]?.filterable) {
        throw new Error("Update key not in model or not filterable");
    }
    const [activeStep, setActiveStep] = useState(0);
    const [state, setState] = useState({
        files: [],
        data: [],
        conversionScripts: importConfig
            ? Object.fromEntries(Object.entries(importConfig).map(([field, script]) => [
                field,
                {
                    script,
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
        // remove /import from url
        FrameworkHistory.push(pathname.substring(0, pathname.lastIndexOf("/")));
    }, [pathname]);
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
    return (React.createElement(Wrapper, { container: true, direction: "column", justifyContent: "space-between", alignItems: "stretch", spacing: 2, wrap: "nowrap" },
        React.createElement(Grid, null,
            React.createElement(Stepper, { activeStep: guided && activeStep > 1 ? activeStep - 1 : activeStep }, IMPORT_STEPS.filter((label, index) => !(guided && index === 1)).map((label, index) => (React.createElement(Step, { key: index.toString(16) },
                React.createElement(StepLabel, null, t(label))))))),
        React.createElement(Grid, { size: "grow" },
            activeStep === 0 && (React.createElement(Step1LoadData, { model: model, howTo: guided ? howTo : undefined, updateKey: updateKey, additionalUpdateKeyFilters: updateKeyAdditionalFilters, hasImportConfig: hasImportConfig, validate: validate, state: state, setState: setState })),
            activeStep === 1 && (React.createElement(Step2ConnectData, { model: model, updateKey: updateKey, additionalUpdateKeyFilters: updateKeyAdditionalFilters, hasImportConfig: hasImportConfig, validate: validate, state: state, setState: setState })),
            activeStep === 2 && (React.createElement(Step3ValidateReview, { model: model, updateKey: updateKey, additionalUpdateKeyFilters: updateKeyAdditionalFilters, hasImportConfig: hasImportConfig, validate: validate, state: state, setState: setState })),
            activeStep === 3 && (React.createElement(Step4Import, { model: model, updateKey: updateKey, additionalUpdateKeyFilters: updateKeyAdditionalFilters, hasImportConfig: hasImportConfig, validate: validate, state: state, setState: setState }))),
        React.createElement(Grid, null,
            React.createElement(Grid, { container: true, spacing: 2 },
                activeStep !== 3 && (React.createElement(Grid, null,
                    React.createElement(Button, { variant: "contained", disabled: activeStep === 0 || activeStep >= 3, onClick: prev }, t("common.buttons.back")))),
                React.createElement(Grid, null,
                    React.createElement(Button, { variant: "contained", disabled: (activeStep === 0 && state.files.length === 0) ||
                            (activeStep === 2 && !state.validationPassed) ||
                            (activeStep === 3 && !state.importDone), onClick: activeStep === 3 ? finish : next }, activeStep === 3
                        ? t("common.buttons.finish")
                        : t("common.buttons.next")))))));
};
export default React.memo(CrudImport);
