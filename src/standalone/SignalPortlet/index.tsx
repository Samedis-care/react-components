import React, { useCallback } from "react";
import SignalPortletItem, { SignalPortletItemProps } from "./SignalPortletItem";
import {
	buttonBaseClasses,
	Divider,
	Grid,
	IconButton,
	List,
	Paper,
	styled,
	Tooltip,
	Typography,
	useThemeProps,
} from "@mui/material";
import { Sync as RefreshIcon } from "@mui/icons-material";
import timestampToAge from "../../utils/timestampToAge";
import useCCTranslations from "../../utils/useCCTranslations";
import useCurrentLocale from "../../utils/useCurrentLocale";
import useAgeTick from "../../utils/useAgeTick";
import combineClassNames from "../../utils/combineClassNames";
import focusRing from "../../utils/internal/focusRing";

export interface SignalPortletProps {
	/**
	 * The title of the portlet
	 */
	title: React.ReactNode;
	/**
	 * The portlet items, one row each, in order. An item's `className` is
	 * added to `classes.item`, which every row gets.
	 */
	items: SignalPortletItemProps[];
	/**
	 * When the shown data was produced, as a Date or in milliseconds since the
	 * epoch (e.g. `Date.now()`). Shows "Last refresh: <age>" in the footer, with
	 * the date and time in a tooltip. The age advances while the card stays
	 * mounted.
	 *
	 * `null`, `undefined`, an invalid time (`NaN`, `new Date("garbage")`) and 0
	 * (the epoch, also as `new Date(0)`, which is what `new Date(null)` gives)
	 * hide the label. So react-query's `dataUpdatedAt`, 0 until the first
	 * successful fetch, can be passed as it is.
	 */
	updatedAt?: number | Date | null | undefined;
	/**
	 * Shows a refresh icon button (named "Refresh") at the end of the footer,
	 * and is called without arguments on every click or keyboard activation of
	 * it. So a function whose parameters are optional, such as react-query's
	 * `refetch`, can be passed as it is. Omit it to hide the button.
	 */
	onRefresh?: () => void;
	/**
	 * Class names per slot, see {@link SignalPortletClassKey}. Each one is
	 * added to its slot's element, next to the slot's theme `styleOverrides`.
	 */
	classes?: Partial<Record<SignalPortletClassKey, string>>;
	/**
	 * Class name to apply to root
	 */
	className?: string;
}

const SignalPortletRoot = styled("div", {
	name: "CcSignalPortlet",
	slot: "root",
})({});
const SignalPortletPaper = styled(Paper, {
	name: "CcSignalPortlet",
	slot: "paper",
})({
	height: "100%",
});
const SignalPortletInnerContainer = styled(Grid, {
	name: "CcSignalPortlet",
	slot: "innerContainer",
})({ height: "100%" });
const SignalPortletDivider = styled(Grid, {
	name: "CcSignalPortlet",
	slot: "divider",
})({});
const SignalPortletTitleWrapper = styled(Grid, {
	name: "CcSignalPortlet",
	slot: "titleWrapper",
})({});
const SignalPortletTitle = styled(Typography, {
	name: "CcSignalPortlet",
	slot: "title",
})({});
const SignalPortletList = styled(List, {
	name: "CcSignalPortlet",
	slot: "list",
})({});
const SignalPortletItemStyled = styled(SignalPortletItem, {
	name: "CcSignalPortlet",
	slot: "item",
})({});
const SignalPortletRefreshIconButton = styled(IconButton, {
	name: "CcSignalPortlet",
	slot: "refreshIconButton",
})(({ theme }) => ({
	// MUI shows keyboard focus on an IconButton only as a faint pulsating ripple
	// (unless the theme sets its focusVisible ring), which forced colors drop.
	// The ring is inside the button, which sits flush in the card's bottom right
	// corner; the button has no focus ripple, which would cover the ring
	[`&.${buttonBaseClasses.focusVisible}`]: focusRing(theme, -2),
}));
const SignalPortletRefreshIcon = styled(RefreshIcon, {
	name: "CcSignalPortlet",
	slot: "refreshIcon",
})({});
const SignalPortletLastUpdatedAt = styled("span", {
	name: "CcSignalPortlet",
	slot: "lastUpdatedAt",
})({});

/**
 * Slots of SignalPortlet, for its `classes` and for the theme's
 * `components.CcSignalPortlet.styleOverrides`:
 * - `root`: the outer `div`, which also gets `className`
 * - `paper`: the MUI Paper in it
 * - `innerContainer`: the column Grid container in the Paper, with the title,
 *   divider and list at the top and the footer at the bottom
 * - `titleWrapper`: the Grid item around the title
 * - `title`: the title Typography (`<h5>`)
 * - `divider`: the Grid item around the MUI Divider
 * - `list`: the MUI List (`<ul>`)
 * - `item`: the `<li>` of every row, the element of CcSignalPortletItem's
 *   `root` slot
 * - `lastUpdatedAt`: the `span` with the "Last refresh" text, shown while
 *   `updatedAt` holds a time
 * - `refreshIconButton`: the Refresh IconButton, shown with `onRefresh`
 * - `refreshIcon`: the refresh icon (`svg`) in that button
 */
export type SignalPortletClassKey =
	| "root"
	| "paper"
	| "divider"
	| "titleWrapper"
	| "title"
	| "list"
	| "item"
	| "refreshIconButton"
	| "refreshIcon"
	| "lastUpdatedAt"
	| "innerContainer";

const SignalPortlet = (inProps: SignalPortletProps) => {
	const props = useThemeProps({ props: inProps, name: "CcSignalPortlet" });
	const { t } = useCCTranslations();
	const locale = useCurrentLocale();
	const updatedTime =
		props.updatedAt == null ? NaN : new Date(props.updatedAt).getTime();
	// 0, the epoch, is no refresh time: it stands for "not yet" (react-query's
	// dataUpdatedAt) or for a missing value (new Date(null))
	const hasUpdatedAt = Number.isFinite(updatedTime) && updatedTime !== 0;
	// re-renders the card while the "Last refresh" age below can change
	useAgeTick(hasUpdatedAt ? updatedTime : null);
	const { onRefresh } = props;
	// onRefresh takes no arguments: it doesn't get the click event
	const handleRefresh = useCallback(() => onRefresh?.(), [onRefresh]);

	return (
		<SignalPortletRoot
			className={combineClassNames([props.className, props.classes?.root])}
		>
			<SignalPortletPaper className={props.classes?.paper}>
				<SignalPortletInnerContainer
					container
					spacing={1}
					sx={{ flexDirection: "column", justifyContent: "space-between" }}
					wrap={"nowrap"}
					className={props.classes?.innerContainer}
				>
					<Grid
						container
						spacing={1}
						sx={{ flexDirection: "column", justifyContent: "flex-start" }}
						wrap={"nowrap"}
						size="grow"
					>
						<SignalPortletTitleWrapper className={props.classes?.titleWrapper}>
							<SignalPortletTitle
								variant={"h5"}
								align={"center"}
								className={props.classes?.title}
							>
								{props.title}
							</SignalPortletTitle>
						</SignalPortletTitleWrapper>
						<SignalPortletDivider className={props.classes?.divider}>
							<Divider />
						</SignalPortletDivider>
						<Grid>
							<SignalPortletList className={props.classes?.list}>
								{props.items.map((item, index) => (
									<SignalPortletItemStyled
										key={index.toString()}
										{...item}
										className={combineClassNames([
											props.classes?.item,
											item.className,
										])}
									/>
								))}
							</SignalPortletList>
						</Grid>
					</Grid>
					{(hasUpdatedAt || props.onRefresh) && (
						<Grid
							container
							spacing={1}
							sx={{
								justifyContent: "flex-end",
								alignItems: "center",
								alignContent: "center",
							}}
						>
							{hasUpdatedAt && (
								<Grid>
									<Tooltip title={new Date(updatedTime).toLocaleString(locale)}>
										<SignalPortletLastUpdatedAt
											className={props.classes?.lastUpdatedAt}
										>
											{t("standalone.signal-portlet.last-updated", {
												AGE: timestampToAge(new Date(updatedTime)),
											})}
										</SignalPortletLastUpdatedAt>
									</Tooltip>
								</Grid>
							)}
							{props.onRefresh && (
								<Grid>
									<SignalPortletRefreshIconButton
										onClick={handleRefresh}
										className={props.classes?.refreshIconButton}
										disableFocusRipple
										size={"small"}
										color={"primary"}
										aria-label={t("standalone.signal-portlet.refresh")}
									>
										<SignalPortletRefreshIcon
											className={props.classes?.refreshIcon}
										/>
									</SignalPortletRefreshIconButton>
								</Grid>
							)}
						</Grid>
					)}
				</SignalPortletInnerContainer>
			</SignalPortletPaper>
		</SignalPortletRoot>
	);
};

export default React.memo(SignalPortlet);
