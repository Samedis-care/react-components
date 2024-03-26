import React from "react";
import combineClassNames from "../../utils/combineClassNames";
import { styled, useThemeProps } from "@mui/material";

const GroupBoxRoot = styled("fieldset", { name: "CcGroupBox", slot: "root" })(
	({ theme }) => ({
		padding: "8px",
		borderStyle: "solid",
		borderColor: "lightgrey",
		borderRadius: theme.shape.borderRadius,
		borderWidth: 1,
		position: "relative",
		maxHeight: "inherit",
		height: "100%",
		marginLeft: 0,
		marginRight: 0,
		minWidth: 0,
		width: "100%",
	}),
);

export interface GroupBoxLegendOwnerState {
	smallLabel: boolean;
}
const GroupBoxLegend = styled("legend", {
	name: "CcGroupBox",
	slot: "legend",
})<{ ownerState: GroupBoxLegendOwnerState }>(
	({ ownerState: { smallLabel } }) => ({
		paddingInlineStart: 5,
		paddingInlineEnd: 5,
		...(smallLabel && {
			fontSize: "0.75em",
		}),
	}),
);

export type GroupBoxClassKey = "root" | "legend";

export interface GroupBoxProps {
	/**
	 * The HTML id of the fieldset
	 */
	id?: string;
	/**
	 * The label of the box
	 */
	label: React.ReactNode;
	/**
	 * The label type of the box
	 */
	smallLabel?: boolean;
	/**
	 * Box contents
	 */
	children?: React.ReactNode;
	/**
	 * CSS class to apply to fieldset
	 */
	className?: string;
	/**
	 * Custom styles
	 */
	classes?: Partial<Record<GroupBoxClassKey, string>>;
}

const GroupBox = (inProps: GroupBoxProps) => {
	const props = useThemeProps({ props: inProps, name: "CcGroupBox" });
	const { id, label, children, smallLabel, className, classes } = props;
	return (
		<GroupBoxRoot
			id={id}
			className={combineClassNames([className, classes?.root])}
		>
			{label && (
				<GroupBoxLegend ownerState={{ smallLabel: !!smallLabel }}>
					{label}
				</GroupBoxLegend>
			)}
			{children}
		</GroupBoxRoot>
	);
};

export default React.memo(GroupBox);
