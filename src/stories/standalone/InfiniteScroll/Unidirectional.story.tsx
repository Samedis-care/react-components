import React, { useState } from "react";
import InfiniteScroll from "../../../standalone/InfiniteScroll";
import { Grid, makeStyles } from "@material-ui/core";
import { number } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";
import { NumberTypeKnobOptions } from "@storybook/addon-knobs/dist/components/types";

const useStyles = makeStyles(
	{
		scrollWrapper: {
			height: "50vh",
			width: "100%",
			overflow: "auto",
			border: "1px solid red",
		},
	},
	{ name: "CcUnidirectionalStory" }
);

const debounceWaitKnobOptions: NumberTypeKnobOptions = {
	range: true,
	min: 0,
	max: 1500,
	step: 1,
};

export const InfiniteScrollSimple = (): React.ReactElement => {
	const classes = useStyles();
	const [items, setItems] = useState<JSX.Element[]>([]);
	const loadMoreBottomAction = action("load-more-bottom");

	return (
		<Grid container>
			<InfiniteScroll
				className={classes.scrollWrapper}
				loadMoreBottom={() => {
					loadMoreBottomAction();
					setItems((prevItems) => [
						...prevItems,
						<Grid key={prevItems.length.toString()} item xs={12}>
							{prevItems.length}
						</Grid>,
					]);
				}}
				callBackDebounce={number("Debounce wait", 100, debounceWaitKnobOptions)}
			>
				{items}
			</InfiniteScroll>
		</Grid>
	);
};

InfiniteScrollSimple.storyName = "Unidirectional";
