import React from "react";
import useCCTranslations from "../../utils/useCCTranslations";
const NumberFormatter = (props) => {
    const { value, options } = props;
    const { i18n } = useCCTranslations();
    return (React.createElement(React.Fragment, null, value != null ? value.toLocaleString(i18n.language, options) : ""));
};
export default React.memo(NumberFormatter);
