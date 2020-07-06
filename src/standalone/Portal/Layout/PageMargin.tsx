import { Hidden, WithStyles, withStyles } from "@material-ui/core";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import React, { PureComponent } from "react";

class PageMargin extends PureComponent<WithStyles> {
	public render() {
		const { classes, children } = this.props;

		return (
			<>
				<div className={classes.toolbarPlaceholder} />
				<Hidden xsDown implementation={"js"}>
					<div className={classes.drawerMargin}>{children}</div>
				</Hidden>
				<Hidden smUp implementation={"js"}>
					<div className={classes.fullWidth}>{children}</div>
				</Hidden>
			</>
		);
	}
}

export const getToolbarHeight = (toolbarStyle: any) => {
	let toolbarHeight: null | number = null;
	Object.keys(toolbarStyle).forEach((key: any) => {
		if (!toolbarStyle.hasOwnProperty(key)) {
			return;
		}

		if (key.startsWith("@media ")) {
			if (matchMedia(key.substring("@media ".length)).matches) {
				const newHeight = ((toolbarStyle[key] as unknown) as CSSProperties)
					.minHeight as number;

				if (toolbarHeight === null || newHeight > toolbarHeight) {
					toolbarHeight = newHeight;
				}
			}
		} else if (toolbarHeight === null) {
			toolbarHeight = toolbarStyle[key] as number;
		}
	});

	return toolbarHeight!;
};

export default withStyles((theme) => ({
	drawerMargin: {
		height: `calc(100vh - ${getToolbarHeight({ ...theme.mixins.toolbar })}px)`,
		marginLeft: theme.appDrawer.width,
		overflow: "auto",
		width: `calc(100vw - ${theme.appDrawer.width}px)`,
	},
	fullWidth: {
		height: `calc(100vh - ${getToolbarHeight({ ...theme.mixins.toolbar })}px)`,
		overflow: "auto",
		width: "100vw",
	},
	toolbarPlaceholder: {
		...theme.mixins.toolbar,
	},
}))(PageMargin);
