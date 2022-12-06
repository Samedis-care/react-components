import React, { useCallback } from "react";
import { Grid, Typography } from "@material-ui/core";
import {
	KeyboardArrowUp as ClosedIcon,
	KeyboardArrowDown as ExpandedIcon,
} from "@material-ui/icons";
import { TreeViewRendererProps } from "./TreeView";

const TreeViewDefaultRenderer = (props: TreeViewRendererProps) => {
	const {
		expanded,
		icon,
		label,
		hasChildren,
		onToggleExpanded,
		id,
		depth,
	} = props;

	const handleExpand = useCallback(() => onToggleExpanded(id), [
		onToggleExpanded,
		id,
	]);

	return (
		<Grid
			container
			style={{
				height: 24,
				marginLeft: depth * 48,
				width: `calc(100% - ${depth * 48}px)`,
			}}
			wrap={"nowrap"}
		>
			{hasChildren && (
				<Grid
					item
					style={{ height: 24 }}
					key={"expandable"}
					onClick={handleExpand}
				>
					{expanded ? <ExpandedIcon /> : <ClosedIcon />}
				</Grid>
			)}
			{icon && (
				<Grid item key={"icon"}>
					{icon}
				</Grid>
			)}
			<Grid item xs key={"label"}>
				<Typography noWrap>{label}</Typography>
			</Grid>
		</Grid>
	);
};

export default React.memo(TreeViewDefaultRenderer);
