import React from "react";
import { FilterIcon } from "../../../standalone";
import { action, withActions } from "@storybook/addon-actions";
import { text, withKnobs } from "@storybook/addon-knobs";
import { Grid } from "@material-ui/core";
import IconButtonWithText, {
	IconButtonWithTextProps,
} from "../../../standalone/UIKit/IconButtonWithText";

const IconButtonProps: IconButtonWithTextProps["IconButtonProps"] = {
	color: "primary",
};
const IconButtonIcon = <FilterIcon />;

export const IconButtonWithTextStory = (): React.ReactElement => {
	return (
		<Grid container>
			<Grid item>Precontent</Grid>
			<Grid item>
				<IconButtonWithText
					IconButtonProps={IconButtonProps}
					icon={IconButtonIcon}
					text={text("Text", "Filter")}
					onClick={action("onClick")}
				/>
			</Grid>
			<Grid item>Post content</Grid>
		</Grid>
	);
};

IconButtonWithTextStory.storyName = "IconButtonWithText";
IconButtonWithTextStory.decorators = [withActions, withKnobs];
