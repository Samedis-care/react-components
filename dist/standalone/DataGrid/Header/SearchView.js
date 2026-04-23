import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useState } from "react";
import { Box, IconButton, InputAdornment, Popover, useMediaQuery, } from "@mui/material";
import { DataGridQuickFilterIcon, useDataGridProps } from "../DataGrid";
import TextFieldWithHelp from "../../UIKit/TextFieldWithHelp";
import combineClassNames from "../../../utils/combineClassNames";
import useCCTranslations from "../../../utils/useCCTranslations";
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
    const { t } = useCCTranslations();
    const [anchorEl, setAnchorEl] = useState(null);
    const openPopover = useCallback((evt) => setAnchorEl(evt.currentTarget), []);
    const closePopover = useCallback(() => setAnchorEl(null), []);
    const renderTextField = () => (_jsx(TextFieldWithHelp, { value: props.search, onChange: props.handleSearchChange, placeholder: searchPlaceholder, slotProps: {
            input: {
                startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(DataGridQuickFilterIcon, { className: combineClassNames([
                            classes?.quickFilterIcon,
                            props.search && "CcDataGrid-quickFilterActiveIcon",
                        ]) }) })),
            },
        }, margin: "dense" }));
    const smDown = useMediaQuery((theme) => theme.breakpoints.down("sm"));
    return (_jsx("div", { className: combineClassNames([props.className, classes?.search]), children: !smDown ? (renderTextField()) : (_jsxs(_Fragment, { children: [_jsx(IconButton, { onClick: openPopover, size: "large", "aria-label": t("standalone.data-grid.header.search"), children: _jsx(DataGridQuickFilterIcon, { className: combineClassNames([
                            classes?.quickFilterIcon,
                            props.search && "CcDataGrid-quickFilterActiveIcon",
                        ]) }) }), _jsx(Popover, { open: anchorEl !== null, anchorEl: anchorEl, onClose: closePopover, anchorOrigin: anchorOrigin, transformOrigin: transformOrigin, children: _jsx(Box, { sx: { p: 1 }, children: renderTextField() }) })] })) }));
};
export default React.memo(SearchView);
