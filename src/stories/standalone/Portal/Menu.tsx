import React from "react";
import { List, makeStyles, withStyles } from "@material-ui/core";
import "../../../i18n";
import {
	JumboReactLightMenuItem,
	JumboReactDarkMenuItem,
	MaterialMenuItem,
	MenuBase,
	PortalLayout,
} from "../../../standalone/Portal";
import { Domain, Home } from "@material-ui/icons";

export default {
	title: "Standalone/Portal",
	component: MenuBase,
};

const useStyles = makeStyles({
	header: {
		width: "100%",
		height: "100%",
		backgroundColor: "red",
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

const usePortalStyles = makeStyles({
	menuWrapper: {
		backgroundColor: "#252525",
	},
	menuChildrenWrapper: {
		backgroundColor: "#1d1d1d",
	},
});

interface IPlaceHolderProps {
	cssClass: "header" | "content" | "topLeft";
}

const Placeholder = (props: IPlaceHolderProps) => {
	const { cssClass } = props;
	const classes = useStyles();
	return <div className={classes[cssClass]}>{cssClass}</div>;
};

export const PortalLayoutStory = () => {
	const classes = usePortalStyles();

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
				headerContent={<Placeholder cssClass={"header"} />}
				menuContent={
					<MenuBase
						className={classes.menuWrapper}
						definition={[
							{
								icon: Home,
								title: "Home",
								onClick: console.log,
								shouldRender: true,
							},
							{
								icon: Domain,
								title: "Admin",
								onClick: console.log,
								shouldRender: true,
								children: [
									{
										title: "Item 1",
										onClick: console.log,
										shouldRender: true,
									},
									{
										title: "Item 2",
										onClick: console.log,
										shouldRender: true,
									},
									{
										title: "Item 3",
										onClick: console.log,
										shouldRender: true,
									},
									{
										title: "Item 4",
										onClick: console.log,
										shouldRender: false,
									},
								],
							},
						]}
						wrapper={List}
						menuItem={JumboReactDarkMenuItem}
						childWrapperClassName={classes.menuChildrenWrapper}
					/>
				}
				topLeft={<Placeholder cssClass={"topLeft"} />}
				content={<Placeholder cssClass={"content"} />}
				drawerWidth={320}
			/>
		</>
	);
};

PortalLayoutStory.story = {
	name: "Menu",
};
