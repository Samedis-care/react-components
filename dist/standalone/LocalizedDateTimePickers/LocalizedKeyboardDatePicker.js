var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import React from "react";
import TypeDate from "../../backend-integration/Model/Types/TypeDate";
import { KeyboardDatePicker, } from "@material-ui/pickers";
import { Event as CalendarIcon } from "@material-ui/icons";
import { useTheme } from "@material-ui/core";
import useCCTranslations from "../../utils/useCCTranslations";
import { withMuiWarning } from "../UIKit";
var LocalizedKeyboardDatePicker = function (props) {
    var _a, _b, _c;
    var hideDisabledIcon = props.hideDisabledIcon, otherProps = __rest(props, ["hideDisabledIcon"]);
    var t = useCCTranslations().t;
    var theme = useTheme();
    var hideDisabledIcons = (_c = (_b = (_a = theme.componentsCare) === null || _a === void 0 ? void 0 : _a.uiKit) === null || _b === void 0 ? void 0 : _b.hideDisabledIcons) !== null && _c !== void 0 ? _c : hideDisabledIcon;
    return (React.createElement(KeyboardDatePicker, __assign({ invalidLabel: t("backend-integration.model.types.renderers.date.labels.invalid"), cancelLabel: t("backend-integration.model.types.renderers.date.labels.cancel"), clearLabel: t("backend-integration.model.types.renderers.date.labels.clear"), okLabel: t("backend-integration.model.types.renderers.date.labels.ok"), todayLabel: t("backend-integration.model.types.renderers.date.labels.today"), invalidDateMessage: t("backend-integration.model.types.renderers.date.labels.invalid-date"), minDateMessage: t("backend-integration.model.types.renderers.date.labels.min-date"), maxDateMessage: t("backend-integration.model.types.renderers.date.labels.max-date"), format: "L", refuse: /([^0-9./-])/gi, rifmFormatter: TypeDate.format, keyboardIcon: hideDisabledIcons && props.disabled ? null : React.createElement(CalendarIcon, null) }, otherProps)));
};
export default React.memo(withMuiWarning(LocalizedKeyboardDatePicker));
