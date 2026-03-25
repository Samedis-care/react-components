import React from "react";
import useCurrentLocale from "../../utils/useCurrentLocale";
const NumberFormatter = (props) => {
    const { value, options } = props;
    const locale = useCurrentLocale();
    return React.createElement(React.Fragment, null, value != null ? value.toLocaleString(locale, options) : "");
};
export default React.memo(NumberFormatter);
