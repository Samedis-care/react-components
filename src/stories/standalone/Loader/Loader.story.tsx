import React from "react";
import { Loader } from "../../../standalone";
import { text } from "@storybook/addon-knobs";

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

LoaderStory.storyName = "Loader";
