import React, { useCallback } from "react";
import { Checkbox, Grid, Typography } from "@mui/material";
import {
	KeyboardArrowUp as ClosedIcon,
	KeyboardArrowDown as ExpandedIcon,
} from "@mui/icons-material";
import { TreeViewRendererProps } from "./TreeView";

const TreeViewCheckboxSelectionRenderer = (props: TreeViewRendererProps) => {
	const {
		expanded,
		icon,
		label,
		hasChildren,
		onToggleExpanded,
		expandLocked,
		id,
		depth,
		hasNext,
		parentHasNext,
		onClick,
		onAuxClick,
	} = props;

	const handleExpand = useCallback(() => onToggleExpanded(id), [
		onToggleExpanded,
		id,
	]);

	const offsetLeft = depth > 0 ? 12 : 0;

	return (
		<Grid
			container
			style={{
				height: 24,
				marginLeft: offsetLeft,
				width: `calc(100% - ${offsetLeft}px)`,
			}}
			wrap={"nowrap"}
		>
			{depth !== 0 && (
				<>
					{parentHasNext.slice(1).map((pHasNext, idx) => (
						<Grid item key={idx}>
							<div
								style={{
									height: 24,
									width: 24,
									borderLeft: pHasNext ? "1px solid black" : undefined,
								}}
							/>
						</Grid>
					))}
					<Grid item>
						<div
							style={{
								height: 12,
								width: 12,
								borderLeft: "1px solid black",
								borderBottom: "1px solid black",
							}}
						/>
						<div
							style={{
								height: 12,
								width: 12,
								borderLeft: hasNext ? "1px solid black" : undefined,
							}}
						/>
					</Grid>
				</>
			)}
			<Grid
				item
				style={{ height: 24 }}
				key={"expandable"}
				onClick={expandLocked ? undefined : handleExpand}
			>
				{hasChildren ? (
					expanded ? (
						<ExpandedIcon />
					) : (
						<ClosedIcon />
					)
				) : (
					<Checkbox style={{ padding: 0 }} checked={expanded} />
				)}
			</Grid>
			{icon && (
				<Grid item key={"icon"} onClick={onClick} onAuxClick={onAuxClick}>
					{icon}
				</Grid>
			)}
			<Grid item xs key={"label"} onClick={onClick} onAuxClick={onAuxClick}>
				<Typography noWrap>{label}</Typography>
			</Grid>
		</Grid>
	);
};

export default React.memo(TreeViewCheckboxSelectionRenderer);
