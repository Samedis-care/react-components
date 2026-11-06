import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useId, useMemo, useState, } from "react";
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
/**
 * The search box: a text field with a search icon, placeholder
 * `placeholder` (default DataGridProps.searchPlaceholder) and accessible name
 * `label`. Below sm it is an icon button ("Search", or `label`) that opens the
 * field in a popover, outside the `search` slot's element. The popover is a
 * dialog named by the button, and its field takes focus when it opens. Must
 * be rendered inside a DataGrid (it reads the grid's props).
 */
const SearchView = (props) => {
    const { searchPlaceholder, classes } = useDataGridProps();
    const { t } = useCCTranslations();
    const [anchorEl, setAnchorEl] = useState(null);
    const openPopover = useCallback((evt) => setAnchorEl(evt.currentTarget), []);
    const closePopover = useCallback(() => setAnchorEl(null), []);
    const open = anchorEl !== null;
    const buttonId = useId();
    const popoverId = useId();
    // the popover is a modal dialog (focus trap, the page behind is hidden from
    // assistive technology), named by the button that opens it
    const popoverSlotProps = useMemo(() => ({
        paper: {
            id: popoverId,
            role: "dialog",
            "aria-modal": true,
            "aria-labelledby": buttonId,
        },
    }), [buttonId, popoverId]);
    const renderTextField = (autoFocus) => (_jsx(TextFieldWithHelp, { autoFocus: autoFocus, value: props.search, onChange: props.handleSearchChange, placeholder: props.placeholder ?? searchPlaceholder, slotProps: {
            htmlInput: { "aria-label": props.label },
            input: {
                startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(DataGridQuickFilterIcon, { className: combineClassNames([
                            classes?.quickFilterIcon,
                            props.search && "CcDataGrid-quickFilterActiveIcon",
                        ]) }) })),
            },
        }, margin: "dense" }));
    const smDown = useMediaQuery((theme) => theme.breakpoints.down("sm"));
    return (_jsx("div", { className: combineClassNames([props.className, classes?.search]), children: !smDown ? (renderTextField(false)) : (_jsxs(_Fragment, { children: [_jsx(IconButton, { id: buttonId, onClick: openPopover, size: "large", "aria-label": props.label ?? t("standalone.data-grid.header.search"), "aria-haspopup": "dialog", "aria-expanded": open, "aria-controls": open ? popoverId : undefined, children: _jsx(DataGridQuickFilterIcon, { className: combineClassNames([
                            classes?.quickFilterIcon,
                            props.search && "CcDataGrid-quickFilterActiveIcon",
                        ]) }) }), _jsx(Popover, { open: open, anchorEl: anchorEl, onClose: closePopover, anchorOrigin: anchorOrigin, transformOrigin: transformOrigin, slotProps: popoverSlotProps, children: _jsx(Box, { sx: { p: 1 }, children: renderTextField(true) }) })] })) }));
};
export default React.memo(SearchView);
