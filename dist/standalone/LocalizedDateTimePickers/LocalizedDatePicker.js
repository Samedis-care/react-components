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
import React from "react";
import { DatePicker } from "@material-ui/pickers";
import useCCTranslations from "../../utils/useCCTranslations";
import { withMuiWarning } from "../UIKit";
var LocalizedDatePicker = function (props) {
    var t = useCCTranslations().t;
    return (React.createElement(DatePicker, __assign({ invalidLabel: t("backend-integration.model.types.renderers.date.labels.invalid"), cancelLabel: t("backend-integration.model.types.renderers.date.labels.cancel"), clearLabel: t("backend-integration.model.types.renderers.date.labels.clear"), okLabel: t("backend-integration.model.types.renderers.date.labels.ok"), todayLabel: t("backend-integration.model.types.renderers.date.labels.today"), invalidDateMessage: t("backend-integration.model.types.renderers.date.labels.invalid-date"), minDateMessage: t("backend-integration.model.types.renderers.date.labels.min-date"), maxDateMessage: t("backend-integration.model.types.renderers.date.labels.max-date"), format: "L", openTo: "date" }, props)));
};
export default React.memo(withMuiWarning(LocalizedDatePicker));
