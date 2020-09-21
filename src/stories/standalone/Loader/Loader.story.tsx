import React from "react";
import { Loader } from "../../../standalone";
import { text, withKnobs } from "@storybook/addon-knobs";

const Settings = {
	title: "Standalone/Loader",
	component: Loader,
	decorators: [withKnobs],
};
export default Settings;

export const LoaderStory = (): React.ReactElement => {
	return (
		<>
			<style
				dangerouslySetInnerHTML={{
					__html: `
				html, body, #root { margin: 0; padding: 0; width: 100%; height: 100%; }			
			`,
				}}
			/>
			<Loader text={text("Status", "")} />
		</>
	);
};

LoaderStory.story = {
	name: "Loader",
};
