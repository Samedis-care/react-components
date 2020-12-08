import React from "react";
import { boolean, text, withKnobs } from "@storybook/addon-knobs";
import { action, withActions } from "@storybook/addon-actions";
import { InfoBox } from "../../../standalone";

export const InfoBoxStory = (): React.ReactElement => {
	return (
		<InfoBox
			heading={text("Heading", "Heading")}
			message={text("Message", "Message")}
			expanded={boolean("Expanded by default?", false)}
			alwaysExpanded={
				boolean("Enable always expanded?", false)
					? boolean("Always expanded", true)
					: undefined
			}
			onChange={action("onChange")}
		/>
	);
};

InfoBoxStory.storyName = "InfoBox";
InfoBoxStory.decorators = [withActions, withKnobs];
