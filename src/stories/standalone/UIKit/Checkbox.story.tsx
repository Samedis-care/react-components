import React from "react";
import { withActions } from "@storybook/addon-actions";
import { boolean, text, withKnobs } from "@storybook/addon-knobs";

import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
// import StyledCheckbox from "../../../standalone/UIKit/Checkbox";
import Checkbox from "../../../standalone/UIKit/Checkbox";

export const CheckboxStory = (): React.ReactElement => {
	const [state, setState] = React.useState({
		checkedA: true,
	});

	const handleChange = (event: {
		target: { name: string; checked: boolean };
	}) => {
		setState({ ...state, [event.target.name]: event.target.checked });
	};

	return (
		<FormGroup row>
			<FormControlLabel
				control={
					<Checkbox
						checked={state.checkedA}
						disabled={boolean("Disabled", false)}
						onChange={handleChange}
						name="checkedA"
					/>
				}
				label={text("Checkbox Label", "Checkbox Label")}
			/>
		</FormGroup>
	);
};

CheckboxStory.storyName = "Checkbox";
CheckboxStory.decorators = [withActions, withKnobs];
