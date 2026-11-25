import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useLayoutEffect, useRef, useState, } from "react";
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
const StepContainer = styled(Grid, { name: "CcCrudImport", slot: "step" })({
    // takes the focus on a step change only (tabIndex -1, not a tab stop): no focus ring
    outline: "none",
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
/**
 * Whether the element can keep the keyboard focus: it is in the document and not disabled
 * @param el The element
 */
const canHoldFocus = (el) => el.isConnected && !el.matches(":disabled");
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
    // Keyboard focus on a step change. A step change can disable the Back or Next that
    // was pressed (Back on the first step, Next until the review passed, Finish until the
    // import is done), and a disabled button loses the focus to the page. Then the step
    // takes the focus, and the button gets it back once it is enabled again in the same step,
    // unless the focus has moved on.
    const stepRef = useRef(null);
    // the element that had the focus when the step was changed (the pressed Back or Next)
    const pressedRef = useRef(null);
    // the button whose focus the step took
    const restoreRef = useRef(null);
    const rememberFocus = useCallback(() => {
        const doc = stepRef.current?.ownerDocument ?? document;
        const active = doc.activeElement;
        pressedRef.current =
            active instanceof HTMLElement && active !== doc.body ? active : null;
        restoreRef.current = null;
    }, []);
    // every commit: a button can be disabled after the step change (a review run again)
    useLayoutEffect(() => {
        const step = stepRef.current;
        if (!step)
            return;
        const active = step.ownerDocument.activeElement;
        const pressed = pressedRef.current;
        if (pressed && !canHoldFocus(pressed)) {
            pressedRef.current = null;
            // the focus is still on the button (the browser moves it later) or fell to the page
            // or to a container around the wizard; focus the user moved elsewhere stays there
            if (!active || active === pressed || active.contains(step)) {
                step.focus({ preventScroll: true });
                restoreRef.current = pressed.isConnected ? pressed : null;
            }
            return;
        }
        const restore = restoreRef.current;
        if (restore && canHoldFocus(restore)) {
            restoreRef.current = null;
            if (active === step)
                restore.focus();
        }
    });
    const next = useCallback(() => {
        rememberFocus();
        setActiveStep((prev) => prev + (prev == 0 && guided ? 2 : 1));
    }, [guided, rememberFocus]);
    const prev = useCallback(() => {
        rememberFocus();
        setActiveStep((prev) => prev - (prev == 2 && guided ? 2 : 1));
    }, [guided, rememberFocus]);
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
        /**
         * For the element that holds the current step, which takes the keyboard focus when a
         * step change disables the focused Back or Next (Back on the first step, Next until the
         * review passed, Finish until the import is done). Give it `tabIndex={-1}`,
         * `role="group"` and the step's label as `aria-label`, so screen readers announce the
         * step. Once that Next or Finish is enabled again, and the focus is still on the step,
         * it gets the focus back. A focused button that stays enabled keeps the focus.
         * Without the ref, focus is left to the browser.
         */
        stepRef,
    };
};
const CrudImport = (props) => {
    const { t } = useCCTranslations();
    const { updateKeyAdditionalFilters, howTo, model, updateKey, validate } = props;
    const { guided, activeStep, state, setState, hasImportConfig, next, prev, finish, stepRef, } = useCrudImportLogic(props);
    return (_jsxs(Wrapper, { container: true, sx: {
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "stretch",
        }, spacing: 2, wrap: "nowrap", children: [_jsx(Grid, { children: _jsx(Stepper, { activeStep: guided && activeStep > 1 ? activeStep - 1 : activeStep, children: IMPORT_STEPS.filter((label, index) => !(guided && index === 1)).map((label, index) => (_jsx(Step, { children: _jsx(StepLabel, { children: t(label) }) }, index.toString(16)))) }) }), _jsxs(StepContainer, { size: "grow", ref: stepRef, tabIndex: -1, role: "group", "aria-label": t(IMPORT_STEPS[activeStep]), children: [activeStep === 0 && (_jsx(Step1LoadData, { model: model, howTo: guided ? howTo : undefined, updateKey: updateKey, additionalUpdateKeyFilters: updateKeyAdditionalFilters, hasImportConfig: hasImportConfig, validate: validate, state: state, setState: setState })), activeStep === 1 && (_jsx(Step2ConnectData, { model: model, updateKey: updateKey, additionalUpdateKeyFilters: updateKeyAdditionalFilters, hasImportConfig: hasImportConfig, validate: validate, state: state, setState: setState })), activeStep === 2 && (_jsx(Step3ValidateReview, { model: model, updateKey: updateKey, additionalUpdateKeyFilters: updateKeyAdditionalFilters, hasImportConfig: hasImportConfig, validate: validate, state: state, setState: setState })), activeStep === 3 && (_jsx(Step4Import, { model: model, updateKey: updateKey, additionalUpdateKeyFilters: updateKeyAdditionalFilters, hasImportConfig: hasImportConfig, validate: validate, state: state, setState: setState }))] }), _jsx(Grid, { children: _jsxs(Grid, { container: true, spacing: 2, children: [activeStep !== 3 && (_jsx(Grid, { children: _jsx(Button, { variant: "contained", disabled: activeStep === 0 || activeStep >= 3, onClick: prev, children: t("common.buttons.back") }) })), _jsx(Grid, { children: _jsx(Button, { variant: "contained", disabled: (activeStep === 0 && state.files.length === 0) ||
                                    (activeStep === 2 && !state.validationPassed) ||
                                    (activeStep === 3 && !state.importDone), onClick: activeStep === 3 ? finish : next, children: activeStep === 3
                                    ? t("common.buttons.finish")
                                    : t("common.buttons.next") }) })] }) })] }));
};
export default React.memo(CrudImport);
