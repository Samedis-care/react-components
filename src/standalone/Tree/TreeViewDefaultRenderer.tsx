import React, { useCallback } from "react";
import { Grid, Typography } from "@mui/material";
import {
	KeyboardArrowUp as ClosedIcon,
	KeyboardArrowDown as ExpandedIcon,
} from "@mui/icons-material";
import { TreeViewRendererProps } from "./TreeView";

const TreeViewDefaultRenderer = (props: TreeViewRendererProps) => {
	const {
		expanded,
		icon,
		label,
		hasChildren,
		onToggleExpanded,
		expandLocked,
		id,
		depth,
		onClick,
		onAuxClick,
	} = props;

	const handleExpand = useCallback(
		() => onToggleExpanded(id),
		[onToggleExpanded, id],
	);

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
					style={{ height: 24 }}
					key={"expandable"}
					onClick={expandLocked ? undefined : handleExpand}
				>
					{expanded ? <ExpandedIcon /> : <ClosedIcon />}
				</Grid>
			)}
			{icon && (
				<Grid key={"icon"} onClick={onClick} onAuxClick={onAuxClick}>
					{icon}
				</Grid>
			)}
			<Grid key={"label"} onClick={onClick} onAuxClick={onAuxClick} size="grow">
				<Typography noWrap>{label}</Typography>
			</Grid>
		</Grid>
	);
};

export default React.memo(TreeViewDefaultRenderer);
