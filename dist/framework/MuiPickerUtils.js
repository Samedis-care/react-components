import React from "react";
import MomentUtils from "@date-io/moment";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import moment from "moment";
import useCCTranslations from "../utils/useCCTranslations";
var MuiPickerUtils = function (props) {
    var disable = props.disable;
    var i18n = useCCTranslations().i18n;
    if (disable)
        return props.children;
    return (React.createElement(MuiPickersUtilsProvider, { libInstance: moment, utils: MomentUtils, locale: i18n.language }, props.children));
};
export default React.memo(MuiPickerUtils);
