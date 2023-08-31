import React from "react";
import useCCTranslations from "../utils/useCCTranslations";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
const MuiPickerUtils = (props) => {
    const { disable } = props;
    const { i18n } = useCCTranslations();
    if (disable)
        return props.children;
    return (React.createElement(LocalizationProvider, { dateAdapter: AdapterMoment, adapterLocale: i18n.language }, props.children));
};
export default React.memo(MuiPickerUtils);
