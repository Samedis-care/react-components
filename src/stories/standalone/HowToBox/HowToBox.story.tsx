import React from "react";
import { text } from "@storybook/addon-knobs";
import { HowToBox } from "../../../standalone";

export const HowToBoxStory = (): React.ReactElement => {
	return (
		<HowToBox
			// optional custom titleLabel
			titleLabel={text("Title", "How it works")}
			// eslint-disable-next-line react/jsx-key
			labels={[<b>Important!</b>, "Less important"]}
		/>
	);
};

HowToBoxStory.storyName = "HowToBox";
