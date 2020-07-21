import React from "react";
import { makeStyles } from "@material-ui/core";
import "../../../i18n";
import { PortalLayout } from "../../../standalone/Portal";
import { boolean, number, withKnobs } from "@storybook/addon-knobs";

export default {
	title: "Standalone/Portal",
	component: PortalLayout,
	decorators: [withKnobs],
};

const useStyles = makeStyles({
	header: {
		width: "100%",
		height: "100%",
		backgroundColor: "red",
	},
	menu: {
		width: "100%",
		height: "100%",
		color: "white",
		backgroundColor: "blue",
	},
	content: {
		width: "100%",
		height: "100%",
		backgroundColor: "green",
	},
	topLeft: {
		width: "100%",
		height: "100%",
		backgroundColor: "yellow",
	},
});

interface IPlaceHolderProps {
	cssClass: "header" | "menu" | "content" | "topLeft";
}

const Placeholder = (props: IPlaceHolderProps) => {
	const { cssClass } = props;
	const classes = useStyles();
	return <div className={classes[cssClass]}>{cssClass}</div>;
};

export const PortalLayoutStory = () => {
	return (
		<>
			<style
				dangerouslySetInnerHTML={{
					__html: `
				html, body, #root { margin: 0; padding: 0; width: 100%; height: 100%; }			
			`,
				}}
			/>
			<PortalLayout
				topLeft={<Placeholder cssClass={"topLeft"} />}
				headerContent={<Placeholder cssClass={"header"} />}
				menuContent={<Placeholder cssClass={"menu"} />}
				content={<Placeholder cssClass={"content"} />}
				drawerWidth={number("Menu width", 320)}
				collapseMenu={boolean("Collapse menu", false)}
			/>
		</>
	);
};

PortalLayoutStory.story = {
	name: "Layout",
};
