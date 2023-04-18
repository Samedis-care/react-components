import React from "react";
import useCCTranslations from "../../utils/useCCTranslations";
var NumberFormatter = function (props) {
    var value = props.value, options = props.options;
    var i18n = useCCTranslations().i18n;
    return (React.createElement(React.Fragment, null, value != null ? value.toLocaleString(i18n.language, options) : ""));
};
export default React.memo(NumberFormatter);
