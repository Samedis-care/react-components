import React from "react";
import { Skeleton, styled, Typography, useThemeProps } from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";

export type StatTileTone = "neutral" | "info" | "success" | "warning" | "error";

export interface StatTileOwnerState {
	tone: StatTileTone;
	outlined: boolean;
	centered: boolean;
	clickable: boolean;
}

const TONED = ["info", "success", "warning", "error"] as const;

// The tone colours the figure through the root, so the value slot stays a
// plain Typography.
const VALUE_CLASS = "CcStatTile-value";

const Root = styled("div", { name: "CcStatTile", slot: "root" })<{
	ownerState: StatTileOwnerState;
}>(({ theme, ownerState }) => ({
	boxSizing: "border-box",
	width: "100%",
	height: "100%",
	display: "flex",
	flexDirection: "column",
	padding: theme.spacing(2),
	borderRadius: theme.shape.borderRadius,
	backgroundColor: theme.palette.background.paper,
	border: "1px solid transparent",
	textAlign: ownerState.centered ? "center" : "left",
	...(ownerState.outlined && { borderColor: theme.palette.divider }),
	...(TONED.includes(ownerState.tone as (typeof TONED)[number]) && {
		borderColor: theme.palette[ownerState.tone as (typeof TONED)[number]].main,
		[`& .${VALUE_CLASS}`]: {
			color: theme.palette[ownerState.tone as (typeof TONED)[number]].main,
		},
	}),
	...(ownerState.clickable && { cursor: "pointer" }),
}));

const Title = styled(Typography, { name: "CcStatTile", slot: "title" })(
	({ theme }) => ({
		display: "block",
		fontSize: "1.75rem",
		fontWeight: 700,
		textTransform: "uppercase",
		color: theme.palette.grey[400],
	}),
) as typeof Typography;

const ValueLine = styled("div", { name: "CcStatTile", slot: "valueLine" })<{
	ownerState: StatTileOwnerState;
}>(({ theme, ownerState }) => ({
	display: "flex",
	flexWrap: "wrap",
	alignItems: "baseline",
	columnGap: theme.spacing(1),
	justifyContent: ownerState.centered ? "center" : "flex-start",
}));

const Value = styled(Typography, { name: "CcStatTile", slot: "value" })(
	({ theme }) => ({
		fontSize: "3.5rem",
		fontWeight: 700,
		color: theme.palette.text.secondary,
	}),
) as typeof Typography;

const ValueSuffix = styled("span", { name: "CcStatTile", slot: "valueSuffix" })(
	({ theme }) => ({
		fontSize: "0.4em",
		fontWeight: 700,
		marginLeft: theme.spacing(0.25),
	}),
);

const SecondaryValue = styled(Typography, {
	name: "CcStatTile",
	slot: "secondaryValue",
})(({ theme }) => ({
	fontSize: "1.25rem",
	fontWeight: 700,
	color: theme.palette.text.secondary,
})) as typeof Typography;

const Subtitle = styled(Typography, { name: "CcStatTile", slot: "subtitle" })(
	({ theme }) => ({
		display: "block",
		fontSize: "1rem",
		fontWeight: 700,
		color: theme.palette.grey[400],
		"&.uppercase": { textTransform: "uppercase" },
	}),
) as typeof Typography;

export type StatTileClassKey =
	| "root"
	| "title"
	| "valueLine"
	| "value"
	| "valueSuffix"
	| "secondaryValue"
	| "subtitle";

export interface StatTileProps {
	/**
	 * Label above the figure, shown in capitals
	 */
	title?: React.ReactNode;
	/**
	 * The figure: a number, or a string that is already formatted (an amount).
	 * null or undefined shows a loading skeleton, unless noValuePlaceholder is set.
	 */
	value: React.ReactNode;
	/**
	 * Shown instead of the skeleton when value is null or undefined: for a
	 * figure that does not exist rather than one that is still loading
	 */
	noValuePlaceholder?: React.ReactNode;
	/**
	 * Small unit directly after the figure (e.g. "%")
	 */
	valueSuffix?: React.ReactNode;
	/**
	 * A second figure on the value's line, after a middle dot, e.g. the amount
	 * behind a count ("11 · 42,180 €")
	 */
	secondaryValue?: React.ReactNode;
	/**
	 * Line of context under the figure
	 */
	subtitle?: React.ReactNode;
	/**
	 * Show the subtitle in capitals
	 * @default true
	 */
	subtitleUppercase?: boolean;
	/**
	 * Keep the subtitle to one line (ellipsis) and keep that line when the
	 * subtitle is empty, so tiles in a row line up
	 * @default false
	 */
	subtitleNoWrap?: boolean;
	/**
	 * Colours the border and the figure. neutral leaves the tile as it is.
	 * @default "neutral"
	 */
	tone?: StatTileTone;
	/**
	 * A thin border around the tile
	 * @default false
	 */
	outlined?: boolean;
	/**
	 * Center the content
	 * @default false
	 */
	centered?: boolean;
	/**
	 * Click handler; makes the tile show a pointer
	 */
	onClick?: React.MouseEventHandler<HTMLDivElement>;
	/**
	 * Auxiliary (middle) click handler
	 */
	onAuxClick?: React.MouseEventHandler<HTMLDivElement>;
	/**
	 * CSS class applied to the root
	 */
	className?: string;
	/**
	 * Custom CSS classes
	 */
	classes?: Partial<Record<StatTileClassKey, string>>;
}

/**
 * A single figure for dashboards: label, value (optionally with a unit and a
 * second figure) and a line of context. Fills the height of its container, so
 * tiles in a row are the same height when the cells stretch.
 */
const StatTile = (inProps: StatTileProps) => {
	const props = useThemeProps({ props: inProps, name: "CcStatTile" });
	const {
		title,
		value,
		noValuePlaceholder,
		valueSuffix,
		secondaryValue,
		subtitle,
		subtitleUppercase = true,
		subtitleNoWrap = false,
		tone = "neutral",
		outlined = false,
		centered = false,
		onClick,
		onAuxClick,
		className,
		classes,
	} = props;

	const ownerState: StatTileOwnerState = {
		tone,
		outlined,
		centered,
		clickable: !!onClick,
	};
	const hasValue = value != null;
	const hasSubtitle = subtitle != null && subtitle !== "";

	return (
		<Root
			ownerState={ownerState}
			className={combineClassNames([className, classes?.root])}
			onClick={onClick}
			onAuxClick={onAuxClick}
		>
			{title != null && (
				<Title component={"span"} className={classes?.title}>
					{title}
				</Title>
			)}
			<ValueLine ownerState={ownerState} className={classes?.valueLine}>
				<Value
					component={"span"}
					className={combineClassNames([VALUE_CLASS, classes?.value])}
				>
					{hasValue
						? value
						: (noValuePlaceholder ?? <Skeleton variant={"text"} />)}
					{hasValue && valueSuffix != null && (
						<ValueSuffix className={classes?.valueSuffix}>
							{valueSuffix}
						</ValueSuffix>
					)}
				</Value>
				{secondaryValue != null && (
					<SecondaryValue
						component={"span"}
						className={classes?.secondaryValue}
					>
						{"· "}
						{secondaryValue}
					</SecondaryValue>
				)}
			</ValueLine>
			{(hasSubtitle || subtitleNoWrap) && (
				<Subtitle
					component={"p"}
					noWrap={subtitleNoWrap}
					className={combineClassNames([
						subtitleUppercase && "uppercase",
						classes?.subtitle,
					])}
				>
					{hasSubtitle ? subtitle : " "}
				</Subtitle>
			)}
		</Root>
	);
};

export default React.memo(StatTile);
