import React from "react";
import { withActions } from "@storybook/addon-actions";
import { boolean, text, withKnobs } from "@storybook/addon-knobs";
import { FormGroup, FormControlLabel, Typography } from "@material-ui/core";
import Checkbox from "../../../standalone/UIKit/Checkbox";

export const CheckboxStory = (): React.ReactElement => {
	const [state, setState] = React.useState({
		checkedA: true,
		checkedB: false,
		checkedC: false,
		checkedD: true,
	});

	const handleChange = (event: {
		target: { name: string; checked: boolean };
	}) => {
		setState({ ...state, [event.target.name]: event.target.checked });
	};

	return (
		<>
			<FormGroup row>
				<FormControlLabel
					control={
						<Checkbox
							size="small"
							checked={state.checkedA}
							disabled={boolean("Disabled", false)}
							onChange={handleChange}
							name="checkedA"
						/>
					}
					label={text("Checkbox A Label", "Checkbox A (size small)")}
				/>
				<FormControlLabel
					labelPlacement="start"
					control={
						<Checkbox
							size="medium"
							checked={state.checkedB}
							disabled={boolean("Disabled", false)}
							onChange={handleChange}
							name="checkedB"
						/>
					}
					label={
						<>
							<Typography variant="caption" display="block" align="right">
								Checkbox B
							</Typography>
							<Typography variant="caption" display="block" align="right">
								Right (start) aligned label
							</Typography>
						</>
					}
				/>
			</FormGroup>
			<FormGroup row>
				<FormControlLabel
					labelPlacement="top"
					control={
						<Checkbox
							size="small"
							checked={state.checkedC}
							disabled={boolean("Disabled", false)}
							onChange={handleChange}
							name="checkedC"
						/>
					}
					label={text(
						"Checkbox C Label",
						"Checkbox C (size small) (top label)"
					)}
				/>
				<FormControlLabel
					labelPlacement="bottom"
					control={
						<Checkbox
							size="medium"
							checked={state.checkedD}
							disabled={boolean("Disabled", false)}
							onChange={handleChange}
							name="checkedD"
						/>
					}
					label={
						<>
							<Typography variant="caption" display="block" align="center">
								Checkbox D
							</Typography>
							<Typography variant="caption" display="block" align="center">
								Formatted
							</Typography>
							<Typography variant="caption" display="block" align="center">
								Bottom Label
							</Typography>
						</>
					}
				/>
			</FormGroup>
		</>
	);
};

CheckboxStory.storyName = "Checkbox";
CheckboxStory.decorators = [withActions, withKnobs];
