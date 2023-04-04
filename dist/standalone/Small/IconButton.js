import { createStyles, IconButton, withStyles } from "@material-ui/core";
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
