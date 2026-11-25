/**
 * The margins of each action in the footer's action bar (select all, Edit,
 * Delete, More and the custom actions), in place of MUI's FormControlLabel
 * margins: 4px above and below, so a caption keeps clear of the footer's
 * edges, and 16px to either side, 8px on phones, where the bar has to fit
 * 320px. With the dividers' own 4px margins an action keeps 20px (12px on
 * phones) to the divider beside it.
 * @param theme The theme, for its spacing and breakpoints
 * @returns The styles of the action's root, its label
 */
const dataActionMargins = (theme) => ({
    margin: theme.spacing(0.5, 2),
    [theme.breakpoints.only("xs")]: {
        margin: theme.spacing(0.5, 1),
    },
});
export default dataActionMargins;
