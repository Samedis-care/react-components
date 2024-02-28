import { IconButton } from "@mui/material";

import createStyles from "@mui/styles/createStyles";
import withStyles from "@mui/styles/withStyles";

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
	IconButton,
);
