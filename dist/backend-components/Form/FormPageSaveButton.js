import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useId, useMemo } from "react";
import { Tooltip } from "@mui/material";
// deep import, not the standalone barrel: this module is reached through the Form barrel
// (see DefaultFormPageButtons)
import ActionButton from "../../standalone/UIKit/ActionButton";
import { useFormContextLite } from "./Form";
import useCCTranslations from "../../utils/useCCTranslations";
import combineClassNames from "../../utils/combineClassNames";
/**
 * The Save button of a form page's footer, as DefaultFormPage and FlowEngineSaveButton
 * render it: an ActionButton that says why the form is read-only.
 *
 * While the Form is read-only and at least one of its read-only reasons has a text
 * (FormProps.readOnlyReasons, a CRUD's editPermissionHint, "The form is currently being
 * saved" while it saves), those texts, joined with ", ", are the button's accessible
 * description and show in a tooltip while the pointer is on the button. Reasons without a
 * text are left out; with none left, the button has no description and no tooltip.
 *
 * It neither saves nor disables itself: pass `onClick` and `disabled` (DefaultFormPage and
 * FlowEngineSaveButton disable it while the form is not dirty, saves or is read-only). A
 * disabled Save stays focusable (see `disabled`), so keyboard focus stays on it during and
 * after a save, and keyboard users reach the reasons too: the tooltip also shows while the
 * button has keyboard focus. An `aria-describedby` of the caller is kept, before the
 * reasons. Render it inside a Form.
 * @remarks The button sits in a `span` that takes the pointer events a disabled button
 *          does not get (MUI's way to put a tooltip on a disabled button), also while the
 *          form is editable, so the button is not mounted again when the form turns
 *          read-only for a save.
 */
const FormPageSaveButton = (props) => {
    const { children, disabled, onClick, className, ...buttonProps } = props;
    const { t } = useCCTranslations();
    const { readOnlyReasons } = useFormContextLite();
    const descriptionId = useId();
    const reason = useMemo(() => Object.values(readOnlyReasons)
        .filter((text) => !!text)
        .join(", "), [readOnlyReasons]);
    const describedBy = reason
        ? [buttonProps["aria-describedby"], descriptionId].filter(Boolean).join(" ")
        : buttonProps["aria-describedby"];
    return (_jsx(Tooltip, { title: reason ? _jsx(_Fragment, { children: reason }) : "", describeChild: true, children: _jsxs("span", { children: [_jsx(ActionButton, { ...buttonProps, "aria-disabled": disabled || undefined, className: combineClassNames([className, disabled && "Mui-disabled"]), onClick: disabled ? undefined : onClick, "aria-describedby": describedBy, children: children ?? t("common.buttons.save") }), reason && (_jsx("span", { id: descriptionId, hidden: true, children: reason }))] }) }));
};
export default React.memo(FormPageSaveButton);
