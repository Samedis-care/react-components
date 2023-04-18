import React, { CSSProperties } from "react";
import SignalPortletItem, { SignalPortletItemDef } from "./SignalPortletItem";
import makeStyles from "@mui/styles/makeStyles";
import { ClassNameMap } from "@mui/styles/withStyles";
import { Divider, Grid, List, Paper, Typography } from "@mui/material";

export interface SignalPortletColorConfig {
	/**
	 * Color used for counter if count != 0
	 */
	colorPresent: NonNullable<CSSProperties["color"]>;
	/**
	 * Color used for counter if count == 0
	 */
	colorNotPresent: NonNullable<CSSProperties["color"]>;
}

export interface SignalPortletProps extends SignalPortletColorConfig {
	/**
	 * The title of the portlet
	 */
	title: React.ReactNode;
	/**
	 * The portlet items
	 */
	items: SignalPortletItemDef[];
	/**
	 * Custom CSS styles
	 */
	classes?: Partial<ClassNameMap<keyof ReturnType<typeof useStyles>>>;
}

const useStyles = makeStyles(
	{
		paper: {
			height: "100%",
		},
		list: {},
		title: {},
		titleWrapper: {},
	},
	{ name: "CcSignalPortlet" }
);

const SignalPortlet = (props: SignalPortletProps) => {
	const classes = useStyles(props);

	return (
		<Paper className={classes.paper}>
			<Grid container spacing={1}>
				<Grid item xs={12} className={classes.titleWrapper}>
					<Typography variant={"h5"} align={"center"} className={classes.title}>
						{props.title}
					</Typography>
				</Grid>
				<Grid item xs={12}>
					<Divider />
				</Grid>
				<Grid item xs={12}>
					<List className={classes.list}>
						{props.items.map((item, index) => (
							<SignalPortletItem
								key={index.toString()}
								colorPresent={props.colorPresent}
								colorNotPresent={props.colorNotPresent}
								{...item}
							/>
						))}
					</List>
				</Grid>
			</Grid>
		</Paper>
	);
};

export default React.memo(SignalPortlet);
