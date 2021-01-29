import React from "react";
import SignalPortlet from "../../../standalone/SignalPortlet";
import { Typography, useTheme } from "@material-ui/core";

export const SignalPortletWithoutLinksStory = (): React.ReactElement => {
	const theme = useTheme();
	return (
		<SignalPortlet
			title={<Typography variant={"h5"}>Storys</Typography>}
			items={[
				{
					count: 123,
					text: "Many",
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

SignalPortletWithoutLinksStory.storyName = "Without Links";
