import { createStyles, IconButton, withStyles } from "@material-ui/core";

const smallIconButtonStyles = createStyles({
	root: {
		padding: 4,
	},
});
export const SmallIconButton = withStyles(smallIconButtonStyles)(IconButton);

const smallestIconButtonStyles = createStyles({
	root: {
		padding: 0,
	},
});
export const SmallestIconButton = withStyles(smallestIconButtonStyles)(
	IconButton
);
