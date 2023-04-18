import React, { useCallback, useState } from "react";
import { Button, Grid, Step, StepLabel, Stepper } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import Step1LoadData from "./Step1LoadData";
import Step2ConnectData from "./Step2ConnectData";
import Step3ValidateReview from "./Step3ValidateReview";
import Step4Import from "./Step4Import";
import { useLocation } from "react-router";
import { FrameworkHistory } from "../../../framework";
import useCCTranslations from "../../../utils/useCCTranslations";
export var IMPORT_STEPS = [
    "backend-components.crud.import.step1",
    "backend-components.crud.import.step2",
    "backend-components.crud.import.step3",
    "backend-components.crud.import.step4",
];
var useStyles = makeStyles({
    wrapper: {
        width: "100%",
        height: "100%",
    },
}, { name: "CcCrudImport" });
export var isFieldImportable = function (name, field) {
    var createVisibility = field.visibility.create;
    var editVisibility = field.visibility.edit;
    var visibilityOkay = typeof createVisibility === "function" ||
        typeof editVisibility === "function" ||
        (!createVisibility.disabled && !createVisibility.readOnly) ||
        (!editVisibility.disabled && !editVisibility.readOnly);
    // no images
    var typeOkay = field.type.getFilterType() !== null;
    return name !== "id" && visibilityOkay && typeOkay;
};
export var useCrudImportLogic = function (props) {
    var _a;
    var model = props.model, importConfig = props.importConfig, updateKey = props.updateKey;
    var guided = props.guided && importConfig;
    var pathname = useLocation().pathname;
    if (updateKey && !((_a = model.fields[updateKey]) === null || _a === void 0 ? void 0 : _a.filterable)) {
        throw new Error("Update key not in model or not filterable");
    }
    var _b = useState(0), activeStep = _b[0], setActiveStep = _b[1];
    var _c = useState({
        files: [],
        data: [],
        conversionScripts: importConfig
            ? Object.fromEntries(Object.entries(importConfig).map(function (_a) {
                var field = _a[0], script = _a[1];
                return [
                    field,
                    {
                        script: script,
                        status: "pending",
                        error: null,
                    },
                ];
            }))
            : {},
        validationPassed: false,
        importDone: false,
    }), state = _c[0], setState = _c[1];
    var hasImportConfig = !!importConfig;
    var next = useCallback(function () { return setActiveStep(function (prev) { return prev + (prev == 0 && guided ? 2 : 1); }); }, [guided]);
    var prev = useCallback(function () { return setActiveStep(function (prev) { return prev - (prev == 2 && guided ? 2 : 1); }); }, [guided]);
    var finish = useCallback(function () {
        // remove /import from url
        FrameworkHistory.push(pathname.substr(0, pathname.lastIndexOf("/")));
    }, [pathname]);
    return {
        guided: guided,
        activeStep: activeStep,
        state: state,
        setState: setState,
        hasImportConfig: hasImportConfig,
        next: next,
        prev: prev,
        finish: finish,
    };
};
var CrudImport = function (props) {
    var classes = useStyles();
    var t = useCCTranslations().t;
    var updateKeyAdditionalFilters = props.updateKeyAdditionalFilters, howTo = props.howTo, model = props.model, updateKey = props.updateKey, validate = props.validate;
    var _a = useCrudImportLogic(props), guided = _a.guided, activeStep = _a.activeStep, state = _a.state, setState = _a.setState, hasImportConfig = _a.hasImportConfig, next = _a.next, prev = _a.prev, finish = _a.finish;
    return (React.createElement(Grid, { container: true, direction: "column", justifyContent: "space-between", alignItems: "stretch", spacing: 2, wrap: "nowrap", className: classes.wrapper },
        React.createElement(Grid, { item: true },
            React.createElement(Stepper, { activeStep: guided && activeStep > 1 ? activeStep - 1 : activeStep }, IMPORT_STEPS.filter(function (label, index) { return !(guided && index === 1); }).map(function (label, index) { return (React.createElement(Step, { key: index.toString(16) },
                React.createElement(StepLabel, null, t(label)))); }))),
        React.createElement(Grid, { item: true, xs: true },
            activeStep === 0 && (React.createElement(Step1LoadData, { model: model, howTo: guided ? howTo : undefined, updateKey: updateKey, additionalUpdateKeyFilters: updateKeyAdditionalFilters, hasImportConfig: hasImportConfig, validate: validate, state: state, setState: setState })),
            activeStep === 1 && (React.createElement(Step2ConnectData, { model: model, updateKey: updateKey, additionalUpdateKeyFilters: updateKeyAdditionalFilters, hasImportConfig: hasImportConfig, validate: validate, state: state, setState: setState })),
            activeStep === 2 && (React.createElement(Step3ValidateReview, { model: model, updateKey: updateKey, additionalUpdateKeyFilters: updateKeyAdditionalFilters, hasImportConfig: hasImportConfig, validate: validate, state: state, setState: setState })),
            activeStep === 3 && (React.createElement(Step4Import, { model: model, updateKey: updateKey, additionalUpdateKeyFilters: updateKeyAdditionalFilters, hasImportConfig: hasImportConfig, validate: validate, state: state, setState: setState }))),
        React.createElement(Grid, { item: true },
            React.createElement(Grid, { container: true, spacing: 2 },
                activeStep !== 3 && (React.createElement(Grid, { item: true },
                    React.createElement(Button, { variant: "contained", disabled: activeStep === 0 || activeStep >= 3, onClick: prev }, t("common.buttons.back")))),
                React.createElement(Grid, { item: true },
                    React.createElement(Button, { variant: "contained", disabled: (activeStep === 2 && !state.validationPassed) ||
                            (activeStep === 3 && !state.importDone), onClick: activeStep === 3 ? finish : next }, activeStep === 3
                        ? t("common.buttons.finish")
                        : t("common.buttons.next")))))));
};
export default React.memo(CrudImport);
