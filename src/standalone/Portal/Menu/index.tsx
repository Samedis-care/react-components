import { Drawer, Hidden, useTheme } from "@material-ui/core";
import React from "react";

interface IProps {
	menuOpen: boolean;
	drawerWidth: number;
	toggleMenu: () => void;
	items: React.Component;
}

export default (props: IProps) => {
	const { drawerWidth, menuOpen, toggleMenu } = props;
	const theme = useTheme();

	return (
		<>
			<Hidden smUp implementation={"js"}>
				<Drawer
					variant={"temporary"}
					anchor={theme.direction === "rtl" ? "right" : "left"}
					open={menuOpen}
					onClose={toggleMenu}
					PaperProps={{
						style: {
							width: drawerWidth,
						},
					}}
					ModalProps={{
						keepMounted: true, // Better open performance on mobile.
					}}
				>
					{props.items}
				</Drawer>
			</Hidden>
			<Hidden xsDown implementation={"js"}>
				<Drawer
					variant={"permanent"}
					open
					PaperProps={{
						style: {
							borderRightWidth: 0,
							width: drawerWidth,
						},
					}}
				>
					{props.items}
				</Drawer>
			</Hidden>
		</>
	);
}