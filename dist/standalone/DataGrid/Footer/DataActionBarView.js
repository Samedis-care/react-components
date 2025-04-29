import React, { useCallback, useState } from "react";
import { Grid, Tooltip, useMediaQuery, useTheme, } from "@mui/material";
import { SmallestIconButton } from "../../Small";
import VerticalDivider from "../../VerticalDivider";
import ComponentWithLabel from "../../UIKit/ComponentWithLabel";
import { Delete as DeleteIcon, Edit as EditIcon, Menu as MenuIcon, } from "@mui/icons-material";
import SelectAll from "./SelectAll";
import { DataGridSelectAllWrapper, useDataGridProps, } from "../DataGrid";
import useCCTranslations from "../../../utils/useCCTranslations";
import DataActionBarMenu from "./DataActionBarMenu";
const DataActionBarView = (props) => {
    const { classes } = useDataGridProps();
    const { t } = useCCTranslations();
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.only("xs"));
    const [extendedMenuAnchor, setExtendedMenuAnchor] = useState(undefined);
    const handleExtendedMenuOpen = useCallback((evt) => {
        setExtendedMenuAnchor(evt.currentTarget);
    }, []);
    const handleExtendedMenuClose = useCallback(() => {
        setExtendedMenuAnchor(undefined);
    }, []);
    const deleteBtn = (React.createElement(ComponentWithLabel, { control: React.createElement(SmallestIconButton, { color: "primary", disabled: props.numSelected === 0 || !props.handleDelete, onClick: props.handleDelete },
            React.createElement(DeleteIcon, null)), labelText: t("standalone.data-grid.footer.delete"), labelPlacement: "bottom", disabled: props.numSelected === 0 || !props.handleDelete }));
    return (React.createElement(Grid, { container: true, wrap: "nowrap" },
        React.createElement(Grid, { key: "select-all" },
            React.createElement(DataGridSelectAllWrapper, { control: React.createElement(SelectAll, null), labelText: t("standalone.data-grid.footer.select-all"), labelPlacement: "bottom", className: classes?.selectAllWrapper, style: props.disableSelection
                    ? { opacity: 0, pointerEvents: "none" }
                    : undefined })),
        props.handleEdit && (React.createElement(React.Fragment, null,
            React.createElement(Grid, { key: "divider-1" },
                React.createElement(VerticalDivider, null)),
            React.createElement(Grid, { key: "edit" },
                React.createElement(ComponentWithLabel, { control: React.createElement(SmallestIconButton, { color: "primary", disabled: props.numSelected !== 1, onClick: props.handleEdit },
                        React.createElement(EditIcon, null)), labelText: t("standalone.data-grid.footer.edit"), labelPlacement: "bottom", disabled: props.numSelected !== 1 })))),
        (props.handleDelete || props.disableDeleteHint) && (React.createElement(React.Fragment, null,
            React.createElement(Grid, { key: "divider-2" },
                React.createElement(VerticalDivider, null)),
            React.createElement(Grid, { key: "delete" }, !props.handleDelete && props.disableDeleteHint ? (React.createElement(Tooltip, { title: props.disableDeleteHint },
                React.createElement("span", null, deleteBtn))) : (deleteBtn)))),
        isXs && props.customButtons && props.customButtons.length > 1 ? (React.createElement(React.Fragment, { key: "custom-buttons-menu" },
            React.createElement(Grid, null,
                React.createElement(VerticalDivider, null)),
            React.createElement(Grid, null,
                React.createElement(ComponentWithLabel, { control: React.createElement(SmallestIconButton, { color: "primary", disabled: !props.customButtons.find((entry) => !entry.isDisabled(props.numSelected)), onClick: handleExtendedMenuOpen },
                        React.createElement(MenuIcon, null)), labelText: t("standalone.data-grid.footer.more"), labelPlacement: "bottom", disabled: !props.customButtons.find((entry) => !entry.isDisabled(props.numSelected)) })),
            React.createElement(DataActionBarMenu, { numSelected: props.numSelected, anchorEl: extendedMenuAnchor, onClose: handleExtendedMenuClose, customButtons: props.customButtons, handleCustomButtonClick: props.handleCustomButtonClick }))) : (props.customButtons?.map((entry) => (React.createElement(React.Fragment, { key: entry.label },
            React.createElement(Grid, null,
                React.createElement(VerticalDivider, null)),
            React.createElement(Grid, null,
                React.createElement(ComponentWithLabel, { control: React.createElement(SmallestIconButton, { color: "primary", disabled: entry.isDisabled(props.numSelected), onClick: () => {
                            props.handleCustomButtonClick(entry.label);
                        } }, entry.icon), labelText: entry.label, labelPlacement: "bottom", disabled: entry.isDisabled(props.numSelected) }))))))));
};
export default React.memo(DataActionBarView);
