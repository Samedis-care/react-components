import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { styled, useMediaQuery, useTheme } from "@mui/material";
import { DataGridPaginationText, useDataGridProps } from "../DataGrid";
import useCCTranslations from "../../../utils/useCCTranslations";
import getCurrentLocale from "../../../utils/getCurrentLocale";
import visuallyHidden from "../../../utils/internal/visuallyHidden";
/**
 * Holds the count, centred in the footer's height, 16px (8px on phones) from
 * the footer's end and from the action bar. A count that takes two lines (on
 * phones, see PaginationView) keeps them at the footer's end. It places the
 * 1px box of the count's words on phones (PaginationWords) in its corner.
 */
const PaginationRoot = styled("div")(({ theme }) => ({
    position: "relative",
    display: "flex",
    alignItems: "center",
    textAlign: "end",
    margin: theme.spacing(0, 2),
    [theme.breakpoints.only("xs")]: {
        margin: theme.spacing(0, 1),
    },
}));
/**
 * The count in words on phones, read out in place of the short form shown
 * there ("Filtered: 3 Total: 10" for "#3/10"), which tells neither what is
 * counted nor which number is which
 */
const PaginationWords = styled("span")(visuallyHidden);
/**
 * The footer's row counts (theme slot `paginationText`): "Total: 10" or
 * "Filtered: 3 Total: 10"; on phones (only xs) "#10" or "#3/10", which
 * assistive technology skips for the same words, visually hidden.
 */
const PaginationView = (props) => {
    const { classes } = useDataGridProps();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.only("xs"));
    const { t, i18n } = useCCTranslations();
    const locale = getCurrentLocale(i18n);
    // digits grouped as the language groups them: 12,345 (en), 12.345 (de)
    const total = props.rowsTotal.toLocaleString(locale);
    const filtered = (props.rowsFiltered ?? 0).toLocaleString(locale);
    const showFiltered = props.rowsFiltered !== null && props.rowsFiltered !== props.rowsTotal;
    const words = showFiltered
        ? t("standalone.data-grid.footer.counts-filtered", {
            FILTERED: filtered,
            TOTAL: total,
        })
        : t("standalone.data-grid.footer.counts", { TOTAL: total });
    return (_jsx(PaginationRoot, { children: _jsx(DataGridPaginationText, { className: classes?.paginationText, children: isMobile ? (_jsxs(_Fragment, { children: [_jsx("span", { "aria-hidden": "true", children: showFiltered
                            ? // may break after the slash where the footer is short of room
                                [`#${filtered}/`, _jsx("wbr", {}, "break"), total]
                            : `#${total}` }), _jsx(PaginationWords, { children: words })] })) : (words) }) }));
};
export default React.memo(PaginationView);
