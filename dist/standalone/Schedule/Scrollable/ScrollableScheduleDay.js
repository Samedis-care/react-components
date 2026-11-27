import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useId } from "react";
import { Grid, styled, useThemeProps } from "@mui/material";
import DayContents from "../Common/DayContents";
import visuallyHidden from "../../../utils/internal/visuallyHidden";
/** width of the bar that marks today's row, in px */
const TODAY_BAR_WIDTH = 4;
const Root = styled("div", {
    name: "CcScrollableScheduleDay",
    slot: "root",
})(({ theme }) => ({
    margin: theme.spacing(0, -2),
    paddingLeft: theme.spacing(1),
    "&.CcScrollableScheduleDay-today": {
        // a border, not only a color, so the mark stays in forced-colors mode;
        // the padding shrinks by its width, so the label stays in line
        borderLeft: `${TODAY_BAR_WIDTH}px solid ${theme.palette.primary.main}`,
        paddingLeft: `calc(${theme.spacing(1)} - ${TODAY_BAR_WIDTH}px)`,
        fontWeight: theme.typography.fontWeightBold,
    },
}));
const Label = styled(Grid, {
    name: "CcScrollableScheduleDay",
    slot: "label",
})({
    // keeps the visually hidden full date in the label's own box, not at the
    // top of the scroll container: a screen reader that brings the date into
    // view then does not scroll the list away from the day
    position: "relative",
});
const FullDate = styled("span", {
    name: "CcScrollableScheduleDay",
    slot: "fullDate",
})(visuallyHidden);
/**
 * One day row of ScrollableSchedule: the date label ("DD ddd") and the day's
 * entries. The row is a group named by the full date, so a screen reader names
 * the day and its date when focus moves into it. The short label is hidden
 * from assistive technology, which reads the visually hidden full date in its
 * place. The forwarded ref is the label cell.
 */
const ScrollableScheduleDay = React.forwardRef(function ScrollableScheduleDay(inProps, ref) {
    const props = useThemeProps({
        props: inProps,
        name: "CcScrollableScheduleDay",
    });
    const labelId = useId();
    return (_jsx(Grid, { size: 12, children: _jsx(Root, { role: "group", "aria-labelledby": labelId, className: props.today ? "CcScrollableScheduleDay-today" : undefined, "aria-current": props.today ? "date" : undefined, children: _jsxs(Grid, { container: true, spacing: 2, children: [_jsxs(Label, { ref: ref, size: 1, id: labelId, children: [_jsx("span", { "aria-hidden": true, children: props.moment.format("DD ddd") }), _jsx(FullDate, { children: props.moment.format("dddd, LL") })] }), _jsx(Grid, { size: 11, children: _jsx(DayContents, { data: props.data }) })] }) }) }));
});
export default React.memo(ScrollableScheduleDay);
