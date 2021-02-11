import React from "react";
import {
	Dialog,
	DialogContent,
	makeStyles,
	IconButton,
} from "@material-ui/core";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import { Close } from "@material-ui/icons";
import { useDialogContext } from "../../framework";
import {
	ImageController,
	IDialogConfigImageBox,
} from "../../standalone/ImageBoxControl/index";
export interface ImageBoxDialogProps
	extends Omit<IDialogConfigImageBox, "classes"> {
	/**
	 * Custom styles
	 */
	classes?: Partial<ReturnType<typeof useStyles>>;
}

const useStyles = makeStyles((theme) => ({
	closeButton: {
		position: "absolute",
		right: theme.spacing(1),
		top: theme.spacing(1),
		color: theme.palette.grey[500],
	},
}));
const ImageDialog = (props: ImageBoxDialogProps) => {
	const [, popDialog] = useDialogContext();
	const classes = useStyles(props);
	const closeDialog = () => popDialog();

	return (
		<Dialog
			onClose={closeDialog}
			maxWidth="lg"
			fullWidth
			disableBackdropClick
			open={true}
		>
			<MuiDialogTitle disableTypography>
				<IconButton
					aria-label="close"
					className={classes.closeButton}
					onClick={closeDialog}
				>
					<Close />
				</IconButton>
			</MuiDialogTitle>
			<DialogContent>
				<ImageController {...props} />
			</DialogContent>
		</Dialog>
	);
};

export const ImageBoxDialog = React.memo(ImageDialog);
