import React from "react";
import { DatePicker } from "@mui/x-date-pickers";
import { withMuiWarning } from "../UIKit";
const LocalizedDatePicker = (props) => {
    return React.createElement(DatePicker, { format: "L", ...props });
};
export default React.memo(withMuiWarning(LocalizedDatePicker));
