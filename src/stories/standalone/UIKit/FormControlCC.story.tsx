import React from "react";
import {
	FormControl,
	FormHelperText,
	FormLabel,
	Grid,
	TextField,
} from "@material-ui/core";
import { useMuiWarningStyles } from "../../../standalone/UIKit/MuiWarning";

const variants = ["none", "warning", "error", "both"];
const isError = (v: string) => v === "error" || v === "both";
const isWarn = (v: string) => v === "warning" || v === "both";
export const FormControlCCStory = (): React.ReactElement => {
	const classes = useMuiWarningStyles();
	const classNameWarn = (v: string) =>
		isWarn(v) ? classes.warning : undefined;
	return (
		<Grid container spacing={2}>
			{variants.map((variant) => (
				<Grid item xs={12} key={variant} container spacing={2}>
					<Grid item xs={3}>
						<FormControl
							className={classNameWarn(variant)}
							error={isError(variant)}
						>
							<FormLabel>Input Label</FormLabel>
							<FormHelperText>{variant}</FormHelperText>
						</FormControl>
						<br />
						<FormLabel
							className={classNameWarn(variant)}
							error={isError(variant)}
						>
							Label Standalone
						</FormLabel>
						<br />
						<FormHelperText
							className={classNameWarn(variant)}
							error={isError(variant)}
						>
							Helper Text Standalone
						</FormHelperText>
					</Grid>
					{["standard", "filled", "outlined"].map((x) => (
						<Grid item xs={3} key={x}>
							<TextField
								label={"Input"}
								placeholder={"placeholder"}
								defaultValue={"data"}
								className={classNameWarn(variant)}
								error={isError(variant)}
								variant={x as "standard" | "filled" | "outlined"}
							/>
						</Grid>
					))}
				</Grid>
			))}
		</Grid>
	);
};

FormControlCCStory.storyName = "FormControlCC";
