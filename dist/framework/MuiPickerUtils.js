import React from "react";
import useCCTranslations from "../utils/useCCTranslations";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
var MuiPickerUtils = function (props) {
    var disable = props.disable;
    var i18n = useCCTranslations().i18n;
    if (disable)
        return props.children;
    return (React.createElement(LocalizationProvider, { dateAdapter: AdapterMoment, adapterLocale: i18n.language }, props.children));
};
export default React.memo(MuiPickerUtils);
