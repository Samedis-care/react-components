import React, { useCallback, useState } from "react";
import { Box, Hidden, IconButton, InputAdornment, Popover, } from "@mui/material";
import { DataGridQuickFilterIcon, useDataGridProps } from "../DataGrid";
import TextFieldWithHelp from "../../UIKit/TextFieldWithHelp";
import combineClassNames from "../../../utils/combineClassNames";
const anchorOrigin = {
    vertical: "bottom",
    horizontal: "center",
};
const transformOrigin = {
    vertical: "top",
    horizontal: "center",
};
const SearchView = (props) => {
    const { searchPlaceholder, classes } = useDataGridProps();
    const [anchorEl, setAnchorEl] = useState(null);
    const openPopover = useCallback((evt) => setAnchorEl(evt.currentTarget), []);
    const closePopover = useCallback(() => setAnchorEl(null), []);
    const renderTextField = () => (React.createElement(TextFieldWithHelp, { value: props.search, onChange: props.handleSearchChange, placeholder: searchPlaceholder, InputProps: {
            startAdornment: (React.createElement(InputAdornment, { position: "start" },
                React.createElement(DataGridQuickFilterIcon, { className: combineClassNames([
                        classes?.quickFilterIcon,
                        props.search && "CcDataGrid-quickFilterActiveIcon",
                    ]) }))),
        }, margin: "dense" }));
    return (React.createElement("div", { className: combineClassNames([props.className, classes?.search]) },
        React.createElement(Hidden, { smDown: true, implementation: "js" }, renderTextField()),
        React.createElement(Hidden, { smUp: true, implementation: "js" },
            React.createElement(IconButton, { onClick: openPopover, size: "large" },
                React.createElement(DataGridQuickFilterIcon, { className: combineClassNames([
                        classes?.quickFilterIcon,
                        props.search && "CcDataGrid-quickFilterActiveIcon",
                    ]) })),
            React.createElement(Popover, { open: anchorEl !== null, anchorEl: anchorEl, onClose: closePopover, anchorOrigin: anchorOrigin, transformOrigin: transformOrigin },
                React.createElement(Box, { p: 1 }, renderTextField())))));
};
export default React.memo(SearchView);
