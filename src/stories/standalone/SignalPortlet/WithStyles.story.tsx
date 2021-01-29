import React from "react";
import SignalPortlet from "../../../standalone/SignalPortlet";
import { Typography, useTheme } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useManyStyles = makeStyles((theme) => ({
	root: {
		backgroundColor: theme.palette.secondary.main,
		color: theme.palette.getContrastText(theme.palette.secondary.main),
	},
}));

export const SignalPortletWithStylesStory = (): React.ReactElement => {
	const theme = useTheme();
	const manyClasses = useManyStyles();

	return (
		<SignalPortlet
			title={<Typography variant={"h5"}>Storys</Typography>}
			items={[
				{
					count: 123,
					text: "Many (Styled)",
					classes: manyClasses,
				},
				{
					count: 0,
					text: "None",
				},
				{
					count: 3,
					text: "Some",
				},
			]}
			colorPresent={theme.palette.primary.main}
			colorNotPresent={theme.palette.grey[500]}
		/>
	);
};

SignalPortletWithStylesStory.storyName = "With Styles";
