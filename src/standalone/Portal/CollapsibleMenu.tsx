import React, { CSSProperties, useCallback, useState } from "react";
import {
	Grid,
	GridProps,
	IconButton,
	IconButtonProps,
} from "@material-ui/core";
import { DoubleArrow } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { usePortalLayoutContext } from "./Layout";

export interface CollapsibleMenuProps {
	children: React.ReactNode;
	classes?: {
		root?: GridProps["className"];
		button?: IconButtonProps["className"];
	};
	width?: CSSProperties["width"];
}

const useStyles = makeStyles({
	container: {
		width: "100%",
		height: "100%",
	},
	iconOpen: {},
	iconClose: {
		transform: "rotate(180deg)",
	},
});

const CollapsibleMenu = (props: CollapsibleMenuProps) => {
	const classes = useStyles();
	const [collapsed, setCollapsed] = useState(false);
	const { mobile } = usePortalLayoutContext();

	const toggleCollapsed = useCallback(() => setCollapsed((prev) => !prev), [
		setCollapsed,
	]);

	return (
		<Grid
			container
			justify={"flex-start"}
			alignItems={"stretch"}
			wrap={"nowrap"}
			className={`${classes.container} ${props.classes?.root ?? ""}`}
		>
			{!collapsed && (
				<Grid item xs style={{ width: props.width }} key={"content"}>
					{props.children}
				</Grid>
			)}
			{!mobile && (
				<Grid item key={"bar"}>
					<IconButton
						onClick={toggleCollapsed}
						className={props.classes?.button}
					>
						<DoubleArrow
							className={collapsed ? classes.iconOpen : classes.iconClose}
						/>
					</IconButton>
				</Grid>
			)}
		</Grid>
	);
};

export default React.memo(CollapsibleMenu);
