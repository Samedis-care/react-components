import React, { useState } from "react";
import { MenuContext, toMenuItemComponent } from "./MenuItem";
import { makeStyles } from "@material-ui/core/styles";
import { SvgIconComponent } from "@material-ui/icons";

export interface IMenuWrapperProps {
	children: React.ReactNode;
}

export interface IMenuItemProps {
	icon?: SvgIconComponent;
	title: string;
	onClick: () => void;
	expandable: boolean;
	active?: boolean; // set if expandable == false
	expanded?: boolean; // set if expandable == true
	depth: number;
}

export interface IMenuItemDefinition {
	icon?: SvgIconComponent;
	title: string;
	onClick: () => void;
	shouldRender: boolean;
	children?: IMenuItemDefinition[];
}

export type MenuItemComponent = React.ComponentType<IMenuItemProps>;

export interface IMenuProps {
	definition: IMenuItemDefinition[];
	wrapper: React.ElementType<IMenuWrapperProps>;
	menuItem: MenuItemComponent;
	className: string;
	childWrapperClassName?: string;
}

const useStyles = makeStyles({
	root: {
		height: "100%",
		width: "100%",
		overflow: "auto",
	},
});

export default (props: IMenuProps) => {
	const Wrapper = props.wrapper;
	const state = useState("");
	const classes = useStyles();

	return (
		<div className={`${classes.root} ${props.className}`}>
			<Wrapper>
				<MenuContext.Provider value={state}>
					{props.definition.map((child) =>
						toMenuItemComponent(props, child, 0)
					)}
				</MenuContext.Provider>
			</Wrapper>
		</div>
	);
};
