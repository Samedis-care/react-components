import React from "react";
import { withKnobs } from "@storybook/addon-knobs";
import { action, withActions } from "@storybook/addon-actions";
import Notifications from "../../../standalone/Notifications";

export const NotificationsStory = (): React.ReactElement => {
	return (
		<Notifications
			loadMore={action("loadMore")}
			onOpen={action("onOpen")}
			notifications={[
				{
					image: "https://via.placeholder.com/256",
					message: "Test notification 1",
					created: new Date(),
					read: false,
				},
				{
					image: "https://via.placeholder.com/256",
					message: "Test notification 2",
					created: new Date(),
					read: true,
				},
				{
					image: "https://via.placeholder.com/256",
					message: "Test notification 3",
					created: new Date(),
					origin: "published by Administrator",
					read: false,
				},
				{
					image: "https://via.placeholder.com/256",
					message: "Test notification 4",
					created: new Date(),
					read: true,
				},
				{
					message: "Test notification 5",
					created: new Date(),
					origin: "published by Administrator",
					read: false,
				},
				{
					message: "Test notification 6",
					created: new Date(),
					origin: "published by Administrator",
					read: true,
				},
				{
					message: "Test notification 7",
					created: new Date(),
					read: false,
				},
				{
					message: "Test notification 8",
					created: new Date(),
					read: true,
				},
			]}
		/>
	);
};

NotificationsStory.storyName = "Notifications";
NotificationsStory.decorators = [withActions, withKnobs];
