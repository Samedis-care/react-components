import React, { useCallback, useState } from "react";
import { Box, Hidden, IconButton, InputAdornment, Popover, } from "@material-ui/core";
import { Search as SearchIcon } from "@material-ui/icons";
import { useDataGridProps, useDataGridStyles } from "../DataGrid";
import TextFieldWithHelp from "../../UIKit/TextFieldWithHelp";
import { combineClassNames } from "../../../utils";
var anchorOrigin = {
    vertical: "bottom",
    horizontal: "center",
};
var transformOrigin = {
    vertical: "top",
    horizontal: "center",
};
var SearchView = function (props) {
    var searchPlaceholder = useDataGridProps().searchPlaceholder;
    var classes = useDataGridStyles();
    var _a = useState(null), anchorEl = _a[0], setAnchorEl = _a[1];
    var openPopover = useCallback(function (evt) { return setAnchorEl(evt.currentTarget); }, []);
    var closePopover = useCallback(function () { return setAnchorEl(null); }, []);
    var renderTextField = function () { return (React.createElement(TextFieldWithHelp, { value: props.search, onChange: props.handleSearchChange, placeholder: searchPlaceholder, InputProps: {
            startAdornment: (React.createElement(InputAdornment, { position: "start" },
                React.createElement(SearchIcon, { className: combineClassNames([
                        props.search && classes.quickFilterActiveIcon,
                    ]) }))),
        }, margin: "dense" })); };
    return (React.createElement(React.Fragment, null,
        React.createElement(Hidden, { xsDown: true, implementation: "js" }, renderTextField()),
        React.createElement(Hidden, { smUp: true, implementation: "js" },
            React.createElement(IconButton, { onClick: openPopover, className: combineClassNames([
                    props.search && classes.quickFilterActiveIcon,
                ]) },
                React.createElement(SearchIcon, null)),
            React.createElement(Popover, { open: anchorEl !== null, anchorEl: anchorEl, onClose: closePopover, anchorOrigin: anchorOrigin, transformOrigin: transformOrigin },
                React.createElement(Box, { p: 1 }, renderTextField())))));
};
export default React.memo(SearchView);
