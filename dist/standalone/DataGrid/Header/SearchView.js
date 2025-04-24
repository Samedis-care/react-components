import React, { useCallback, useState } from "react";
import { Box, IconButton, InputAdornment, Popover, useMediaQuery, } from "@mui/material";
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
    const renderTextField = () => (React.createElement(TextFieldWithHelp, { value: props.search, onChange: props.handleSearchChange, placeholder: searchPlaceholder, slotProps: {
            input: {
                startAdornment: (React.createElement(InputAdornment, { position: "start" },
                    React.createElement(DataGridQuickFilterIcon, { className: combineClassNames([
                            classes?.quickFilterIcon,
                            props.search && "CcDataGrid-quickFilterActiveIcon",
                        ]) }))),
            },
        }, margin: "dense" }));
    const smDown = useMediaQuery((theme) => theme.breakpoints.down("sm"));
    return (React.createElement("div", { className: combineClassNames([props.className, classes?.search]) }, !smDown ? (renderTextField()) : (React.createElement(React.Fragment, null,
        React.createElement(IconButton, { onClick: openPopover, size: "large" },
            React.createElement(DataGridQuickFilterIcon, { className: combineClassNames([
                    classes?.quickFilterIcon,
                    props.search && "CcDataGrid-quickFilterActiveIcon",
                ]) })),
        React.createElement(Popover, { open: anchorEl !== null, anchorEl: anchorEl, onClose: closePopover, anchorOrigin: anchorOrigin, transformOrigin: transformOrigin },
            React.createElement(Box, { p: 1 }, renderTextField()))))));
};
export default React.memo(SearchView);
