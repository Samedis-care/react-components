import React from "react";
import { action } from "@storybook/addon-actions";
import Notifications from "../../../standalone/Notifications";

export const NotificationsStory = (): React.ReactElement => {
	return (
		<Notifications
			loadRead={action("loadRead")}
			loadUnread={action("loadUnread")}
			loadLatest={action("loadLatest")}
			onOpen={action("onOpen")}
			notifications={[
				{
					id: "1",
					image: "https://via.placeholder.com/256",
					message: "Test notification 1",
					created: new Date(),
					read: false,
				},
				{
					id: "2",
					image: "https://via.placeholder.com/256",
					message: "Test notification 2",
					created: new Date(),
					read: true,
				},
				{
					id: "3",
					image: "https://via.placeholder.com/256",
					message: "Test notification 3",
					created: new Date(),
					origin: "published by Administrator",
					read: false,
				},
				{
					id: "4",
					image: "https://via.placeholder.com/256",
					message: "Test notification 4",
					created: new Date(),
					read: true,
				},
				{
					id: "5",
					message: "Test notification 5",
					created: new Date(),
					origin: "published by Administrator",
					read: false,
				},
				{
					id: "6",
					message: "Test notification 6",
					created: new Date(),
					origin: "published by Administrator",
					read: true,
				},
				{
					id: "7",
					message: "Test notification 7",
					created: new Date(),
					read: false,
				},
				{
					id: "8",
					message: "Test notification 8",
					created: new Date(),
					read: true,
				},
			]}
		/>
	);
};

NotificationsStory.storyName = "Notifications";
