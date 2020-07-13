import { Drawer, Hidden, Paper, useTheme } from "@material-ui/core";
import React, { useMemo } from "react";
import { makeStyles } from "@material-ui/core/styles";

interface IProps {
	menuOpen: boolean;
	drawerWidth: number;
	toggleMenu: () => void;
	items: JSX.Element;
}

const modalProps = {
	keepMounted: true, // Better open performance on mobile.
};

const useStyles = makeStyles(() => ({
	menuPaper: (props: IProps) => ({
		width: props.drawerWidth,
		height: "100%",
	}),
}));

export default (props: IProps) => {
	const { menuOpen, toggleMenu } = props;
	const theme = useTheme();
	const classes = useStyles(props);

	const paperProps = useMemo(
		() => ({
			className: classes.menuPaper,
		}),
		[classes.menuPaper]
	);

	return (
		<>
			<Hidden smUp implementation={"js"}>
				<Drawer
					variant={"temporary"}
					anchor={theme.direction === "rtl" ? "right" : "left"}
					open={menuOpen}
					onClose={toggleMenu}
					PaperProps={paperProps}
					ModalProps={modalProps}
				>
					{props.items}
				</Drawer>
			</Hidden>
			<Hidden xsDown implementation={"js"}>
				<Paper {...paperProps}>{props.items}</Paper>
			</Hidden>
		</>
	);
};
