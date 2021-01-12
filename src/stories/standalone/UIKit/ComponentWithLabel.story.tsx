import React from "react";
import { action } from "@storybook/addon-actions";
import { select, text, boolean } from "@storybook/addon-knobs";
import { Grid, IconButton } from "@material-ui/core";
import {
	ArrowBack as ArrowBackIcon,
	ArrowForward as ArrowForwardIcon,
	ArrowUpward as ArrowUpwardIcon,
	ArrowDownward as ArrowDownwardIcon,
} from "@material-ui/icons";
import ComponentWithLabel, {
	ComponentWithLabelProps,
} from "../../../standalone/UIKit/ComponentWithLabel";

const labelPlacementValues: Array<ComponentWithLabelProps["labelPlacement"]> = [
	"end",
	"start",
	"top",
	"bottom",
];

export const ComponentWithLabelStory = (): React.ReactElement => {
	return (
		<Grid container justify="center" spacing={2} alignItems="center">
			<Grid item>
				<ComponentWithLabel
					disabled={boolean("label left disabled state", true)}
					labelPlacement={select(
						"labelPlacement left",
						labelPlacementValues,
						"start"
					)}
					control={
						<IconButton onClick={action("onClick")} color="primary">
							<ArrowBackIcon />
						</IconButton>
					}
					labelText={text(
						"labelText left",
						"I am a label\nat the start\nwith as many\nlines to display\nas you want\nand even\nsome more\nset it to\ndisabled if needed"
					)}
				/>
			</Grid>
			<Grid item>
				<Grid container direction="column" alignItems="center">
					<Grid item>
						<ComponentWithLabel
							labelPlacement={select(
								"labelPlacement top",
								labelPlacementValues,
								"top"
							)}
							control={
								<IconButton onClick={action("onClick")} color="secondary">
									<ArrowUpwardIcon />
								</IconButton>
							}
							labelText={text("labelText top", "I am a label\nat the top")}
						/>
					</Grid>
					<Grid item>
						<ComponentWithLabel
							labelPlacement={select(
								"labelPlacement bottom",
								labelPlacementValues,
								"bottom"
							)}
							control={
								<IconButton onClick={action("onClick")} color="secondary">
									<ArrowDownwardIcon />
								</IconButton>
							}
							labelText={text(
								"labelText bottom",
								"I am a label\nat the bottom"
							)}
						/>
					</Grid>
				</Grid>
			</Grid>
			<br />
			<Grid item>
				<ComponentWithLabel
					labelPlacement={select(
						"labelPlacement right",
						labelPlacementValues,
						"end"
					)}
					control={
						<IconButton onClick={action("onClick")} color="primary">
							<ArrowForwardIcon />
						</IconButton>
					}
					labelText={text(
						"labelText right",
						"I am a label\nat the end.\nClicking the label\nwill forward the\nclick to\nthe control\nwhich can be\nany Button\nor Form element"
					)}
				/>
			</Grid>
		</Grid>
	);
};

ComponentWithLabelStory.storyName = "ComponentWithLabel";
