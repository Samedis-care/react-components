import React from "react";
import BaseSelector from "./BaseSelector";
const SingleSelect = (props) => {
    return React.createElement(BaseSelector, { ...props });
};
export default React.memo(SingleSelect);
