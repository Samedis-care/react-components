import React from "react";
import { Loader } from "../../../standalone";
import { text } from "@storybook/addon-knobs";

export default {
	title: "Standalone/Loader",
	component: Loader,
};

export const LoaderStory = () => {
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
