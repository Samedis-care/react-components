import React from "react";
import { action } from "@storybook/addon-actions";
import { boolean, text } from "@storybook/addon-knobs";
import { FormGroup } from "@material-ui/core";
import Checkbox from "../../../standalone/UIKit/Checkbox";
import {
	Notifications as NotificationsIcon,
	NotificationsOff as NotificationsOffIcon,
} from "@material-ui/icons";
import ComponentWithLabel from "../../../standalone/UIKit/ComponentWithLabel";

export const CheckboxStory = (): React.ReactElement => {
	const [state, setState] = React.useState({
		checkedA: true,
		checkedB: false,
		checkedC: false,
		checkedD: true,
		checkedX: true,
	});

	const handleChange = (event: {
		target: { name: string; checked: boolean };
	}) => {
		setState({ ...state, [event.target.name]: event.target.checked });
		action("onChange");
	};

	return (
		<>
			<FormGroup row>
				<ComponentWithLabel
					labelPlacement="bottom"
					control={
						<Checkbox
							size="medium"
							icon={<NotificationsOffIcon />}
							checkedIcon={<NotificationsIcon />}
							checked={state.checkedX}
							disabled={boolean("Disabled", false)}
							onChange={handleChange}
							name="checkedX"
						/>
					}
					labelText={"Checkbox X\nsize medium\nAlternative Icons"}
				/>
			</FormGroup>
			<FormGroup row>
				<ComponentWithLabel
					control={
						<Checkbox
							size="small"
							checked={state.checkedA}
							disabled={boolean("Disabled", false)}
							onChange={handleChange}
							name="checkedA"
						/>
					}
					labelText={text("Checkbox A Label", "Checkbox A (size small)")}
				/>
				<ComponentWithLabel
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
					labelText={"Checkbox B\nsize medium\nRight (start) aligned label"}
				/>
			</FormGroup>
			<FormGroup row>
				<ComponentWithLabel
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
					labelText={text(
						"Checkbox C Label",
						"Checkbox C (size small) (top label)"
					)}
				/>
				<ComponentWithLabel
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
					labelText={"Checkbox D\nsize medium\nBottom Label"}
				/>
			</FormGroup>
		</>
	);
};

CheckboxStory.storyName = "Checkbox";
