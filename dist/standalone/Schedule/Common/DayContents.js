import { jsx as _jsx } from "react/jsx-runtime";
import React, { useMemo } from "react";
import { Button, Grid, styled, useThemeProps } from "@mui/material";
import combineColors from "../../../utils/combineColors";
const StyledButton = styled(Button, { name: "CcDayContents", slot: "button" })(({ theme, ownerState: { altBorder, unClickable } }) => ({
    textTransform: "none",
    textAlign: "left",
    color: "inherit",
    display: "block",
    overflowWrap: "anywhere",
    ...(altBorder && {
        borderColor: `rgba(${combineColors(theme.palette.background.paper, theme.palette.action.hover).join()})`,
        "&:hover": {
            borderColor: theme.palette.background.paper,
        },
    }),
    ...(unClickable && {
        cursor: "default",
    }),
}));
/**
 * Wraps an entry's `onAuxClick` so it runs for the middle button only:
 * browsers fire `auxclick` for every non-primary button, the right one (which
 * opens the context menu), back and forward included.
 * @param handler the entry's `onAuxClick`
 * @returns the handler for the entry's `auxclick` event
 */
const middleButtonOnly = (handler) => (evt) => {
    if (evt.button !== 1)
        return;
    handler(evt);
};
const DayContents = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcDayContents" });
    const { data, altBorder, className, classes } = props;
    // the entries' auxclick handlers, by index in data
    const auxClickHandlers = useMemo(() => data.map((entry) => entry.onAuxClick && middleButtonOnly(entry.onAuxClick)), [data]);
    return (_jsx(Grid, { container: true, spacing: 2, className: className, children: data.map((entry, idx) => (_jsx(Grid, { size: 12, children: _jsx(StyledButton, { variant: "outlined", size: "small", fullWidth: true, ownerState: {
                    altBorder: !!altBorder,
                    unClickable: !entry.onClick && !entry.onAuxClick,
                }, className: classes?.button, onClick: entry.onClick, onAuxClick: auxClickHandlers[idx], disableRipple: !entry.onClick && !entry.onAuxClick, children: entry.title }) }, entry.id))) }));
};
export default React.memo(DayContents);
