import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import useCurrentLocale from "../../utils/useCurrentLocale";
const NumberFormatter = (props) => {
    const { value, options } = props;
    const locale = useCurrentLocale();
    return _jsx(_Fragment, { children: value != null ? value.toLocaleString(locale, options) : "" });
};
export default React.memo(NumberFormatter);
