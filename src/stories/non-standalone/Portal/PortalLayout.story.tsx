import React from "react";
import { List, makeStyles } from "@material-ui/core";
import "../../../i18n";
import {
	MaterialMenuItem,
	PortalLayoutX as PortalLayout,
} from "../../../standalone/PortalLayout";
import { Domain, Home } from "@material-ui/icons";
import { button, select, withKnobs } from "@storybook/addon-knobs";
import { FrameworkHistory, RoutedMenu } from "../../..";
import { withActions } from "@storybook/addon-actions";

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

export const PortalLayoutStory = (): React.ReactElement => {
	const classes = usePortalStyles();

	button("Navigate to Home (/)", () => FrameworkHistory.push("/"));
	button("Navigate to Admin Item 1 (/admin/1)", () =>
		FrameworkHistory.push("/admin/1")
	);
	button("Navigate to Admin Item 2 (/admin/2)", () =>
		FrameworkHistory.push("/admin/2")
	);
	button("Navigate to Admin Item 3 (/admin/3)", () =>
		FrameworkHistory.push("/admin/3")
	);
	button("Navigate to Admin Item 4 (/admin/4)", () =>
		FrameworkHistory.push("/admin/4")
	);

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
				headerContent={<>Header Title</>}
				menuContent={
					<RoutedMenu
						enableToggle={true}
						definition={[
							{
								icon: Home,
								title: "Home",
								route: "/",
								shouldRender: true,
							},
							{
								icon: Domain,
								title: "Admin",
								shouldRender: true,
								children: [
									{
										title: "Item 1",
										route: "/admin/1",
										shouldRender: true,
									},
									{
										title: "Item 2",
										route: "/admin/2",
										shouldRender: true,
									},
									{
										title: "Item 3",
										route: "/admin/3",
										shouldRender: true,
									},
									{
										title: "Item 4",
										route: "/admin/4",
										shouldRender: false,
									},
								],
							},
						]}
						wrapper={List}
						menuItem={MaterialMenuItem}
						childWrapperClassName={undefined}
					/>
				}
				content={<></>} //{<Placeholder cssClass={"content"} />}
				drawerWidth={320}
			/>
		</>
	);
};

PortalLayoutStory.storyName = "PortalLayout";
PortalLayoutStory.decorators = [withActions, withKnobs];
