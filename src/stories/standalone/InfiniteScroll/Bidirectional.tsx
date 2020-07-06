import React, { useState } from "react";
import InfiniteScroll from "../../../standalone/InfiniteScroll";
import { Grid, makeStyles } from "@material-ui/core";
import { withKnobs, number } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";

export default {
	title: "Standalone/InfiniteScroll",
	component: InfiniteScroll,
	decorators: [withKnobs],
};

const useStyles = makeStyles(() => ({
	scrollWrapper: {
		height: "50vh",
		width: "100%",
		overflow: "auto",
		border: "1px solid red",
	},
}));

const debounceWaitKnobOptions = {
	range: true,
	min: 0,
	max: 1500,
	step: 1,
};

export const Bidirectional = () => {
	const classes = useStyles();
	const [items, setItems] = useState<JSX.Element[]>([]);
	const loadMoreTopAction = action("load-more-top");
	const loadMoreBottomAction = action("load-more-bottom");

	return (
		<Grid container>
			<InfiniteScroll
				className={classes.scrollWrapper}
				loadMoreTop={() => {
					loadMoreTopAction();
					setItems((prevItems) => [
						<Grid item xs={12}>
							{prevItems.length}
						</Grid>,
						...prevItems,
					]);
				}}
				loadMoreBottom={() => {
					loadMoreBottomAction();
					setItems((prevItems) => [
						...prevItems,
						<Grid item xs={12}>
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

Bidirectional.story = {
	name: "Bidirectional",
};
