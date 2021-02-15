import React from "react";
import { List, makeStyles } from "@material-ui/core";
import "../../../i18n";
import {
	JumboReactLightMenuItem,
	JumboReactDarkMenuItem,
	MaterialMenuItem,
	MenuBase,
	PortalLayout,
	CollapsibleMenu,
} from "../../../standalone/Portal";
import { Domain, Home } from "@material-ui/icons";
import { boolean, select } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";

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
	collapse: {
		color: "#A1A1A1",
	},
	menuChildrenWrapper: {
		backgroundColor: "#1d1d1d",
	},
	toolbar: {
		minHeight: 32,
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

export const PortalMenuStory = (): React.ReactElement => {
	const variant = select(
		"Variant",
		{
			Material: "Material",
			JumboLight: "JumboLight",
			JumboDark: "JumboDark",
		},
		"Material"
	);
	const collapsible = boolean("Collapsible Menu", true);

	const classes = usePortalStyles();

	const menu = () => (
		<MenuBase
			className={variant === "JumboDark" ? classes.menuWrapper : undefined}
			definition={[
				{
					icon: Home,
					title: "Home Sweet Home Sweet Home",
					onClick: () => action("onClick: Home"),
					shouldRender: true,
				},
				{
					icon: Domain,
					title: "Admin",
					onClick: () => action("onClick: Admin"),
					shouldRender: true,
					children: [
						{
							title: "Item 1",
							onClick: () => action("onClick: Admin/Item 1"),
							shouldRender: true,
						},
						{
							title: "Item 2",
							onClick: () => action("onClick: Admin/Item 2"),
							shouldRender: true,
						},
						{
							title: "Item 3",
							onClick: () => action("onClick: Admin/Item 3"),
							shouldRender: true,
						},
						{
							title: "Item 4",
							onClick: () => action("onClick: Admin/Item 4"),
							shouldRender: false,
						},
					],
				},
			]}
			wrapper={List}
			menuItem={
				variant === "JumboDark"
					? JumboReactDarkMenuItem
					: variant === "JumboLight"
					? JumboReactLightMenuItem
					: MaterialMenuItem
			}
			childWrapperClassName={
				variant === "JumboDark" ? classes.menuChildrenWrapper : undefined
			}
		/>
	);

	return (
		<>
			<style
				dangerouslySetInnerHTML={{
					__html: `
				html, body, #root { margin: 0 !important; padding: 0 !important; width: 100%; height: 100%; }
			`,
				}}
			/>
			<PortalLayout
				variant={collapsible ? "no-top-left" : "basic"}
				headerContent={<Placeholder cssClass={"header"} />}
				menuContent={
					collapsible ? (
						<CollapsibleMenu
							customClasses={
								variant === "JumboDark"
									? {
											root: classes.menuWrapper,
											button: classes.collapse,
									  }
									: undefined
							}
							//width={320}
						>
							{menu()}
						</CollapsibleMenu>
					) : (
						menu()
					)
				}
				topLeft={<Placeholder cssClass={"topLeft"} />}
				content={<Placeholder cssClass={"content"} />}
				//drawerWidth={collapsible ? undefined : 320}
				customClasses={{
					header: {
						toolbar: {
							regular: classes.toolbar,
						},
					},
				}}
			/>
		</>
	);
};

PortalMenuStory.storyName = "Menu";
