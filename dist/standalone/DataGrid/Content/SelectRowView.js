import { jsx as _jsx } from "react/jsx-runtime";
import React, { useMemo } from "react";
import { DataGridSelectCheckbox, useDataGridProps } from "../DataGrid";
import useCCTranslations from "../../../utils/useCCTranslations";
const SelectRowView = (props) => {
    const { classes } = useDataGridProps();
    const { t } = useCCTranslations();
    const { rowLabel } = props;
    const slotProps = useMemo(() => ({
        input: {
            "aria-label": rowLabel
                ? t("standalone.data-grid.content.select-row", { ROW: rowLabel })
                : t("standalone.data-grid.content.select-row-fallback"),
        },
    }), [rowLabel, t]);
    return (_jsx(DataGridSelectCheckbox, { disabled: props.disabled, checked: props.checked, className: classes?.selectCheckbox, slotProps: slotProps }));
};
export default React.memo(SelectRowView);
