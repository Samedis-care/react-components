import { jsx as _jsx } from "react/jsx-runtime";
import React, { useState } from "react";
import { DataGridPaginationText, useDataGridProps, useDataGridState, } from "../DataGrid";
import useCCTranslations from "../../../utils/useCCTranslations";
import getCurrentLocale from "../../../utils/getCurrentLocale";
/**
 * The filter panel's row count, in the words of the grid's footer
 * ("Filtered: 3 Total: 40", the digits grouped as the language groups them),
 * which the panel hides. A status region, so a screen reader hears the count
 * a pick leads to. It shows the count of the last finished load: a reload
 * starts by counting 0 rows, and the region is busy until the new count is
 * in. Empty while the panel's first count is loading, and after a failed
 * load.
 */
const FilterDialogCount = () => {
    const [state] = useDataGridState();
    const { classes } = useDataGridProps();
    const { t, i18n } = useCCTranslations();
    const locale = getCurrentLocale(i18n);
    const loading = state.refreshData !== 0;
    const settled = !loading && !state.dataLoadError;
    const [shown, setShown] = useState(() => settled ? { total: state.rowsTotal, filtered: state.rowsFiltered } : null);
    // follows the grid state, except while it reloads
    if (settled &&
        (shown?.total !== state.rowsTotal || shown.filtered !== state.rowsFiltered)) {
        setShown({ total: state.rowsTotal, filtered: state.rowsFiltered });
    }
    const visible = state.dataLoadError ? null : shown;
    let text = "";
    if (visible) {
        const total = visible.total.toLocaleString(locale);
        text =
            visible.filtered !== null && visible.filtered !== visible.total
                ? t("standalone.data-grid.footer.counts-filtered", {
                    FILTERED: visible.filtered.toLocaleString(locale),
                    TOTAL: total,
                })
                : t("standalone.data-grid.footer.counts", { TOTAL: total });
    }
    return (_jsx(DataGridPaginationText, { role: "status", "aria-busy": loading, className: classes?.paginationText, children: text }));
};
export default React.memo(FilterDialogCount);
