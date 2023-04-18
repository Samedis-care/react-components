import { IconButton } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import withStyles from "@mui/styles/withStyles";
var smallIconButtonStyles = createStyles({
    root: {
        padding: 4,
    },
});
export var SmallIconButton = withStyles(smallIconButtonStyles)(IconButton);
var smallestIconButtonStyles = createStyles({
    root: {
        padding: 0,
    },
});
export var SmallestIconButton = withStyles(smallestIconButtonStyles)(IconButton);
