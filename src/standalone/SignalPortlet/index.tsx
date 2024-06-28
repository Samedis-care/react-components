import React from "react";
import SignalPortletItem, { SignalPortletItemProps } from "./SignalPortletItem";
import {
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
import combineClassNames from "../../utils/combineClassNames";

export interface SignalPortletProps {
	/**
	 * The title of the portlet
	 */
	title: React.ReactNode;
	/**
	 * The portlet items
	 */
	items: SignalPortletItemProps[];
	/**
	 * Updated at (optional)
	 */
	updatedAt?: number | Date | null | undefined;
	/**
	 * Refresh handler
	 */
	onRefresh?: () => void;
	/**
	 * Custom CSS classes
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
})({});
const SignalPortletRefreshIcon = styled(RefreshIcon, {
	name: "CcSignalPortlet",
	slot: "refreshIcon",
})({});
const SignalPortletLastUpdatedAt = styled("span", {
	name: "CcSignalPortlet",
	slot: "lastUpdatedAt",
})({});

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
	| "lastUpdatedAt";

const SignalPortlet = (inProps: SignalPortletProps) => {
	const props = useThemeProps({ props: inProps, name: "CcSignalPortlet" });
	const { t, i18n } = useCCTranslations();

	return (
		<SignalPortletRoot
			className={combineClassNames([props.className, props.classes?.root])}
		>
			<SignalPortletPaper className={props.classes?.paper}>
				<SignalPortletInnerContainer
					container
					spacing={1}
					direction={"column"}
					justifyContent={"space-between"}
					wrap={"nowrap"}
				>
					<SignalPortletTitleWrapper
						item
						className={props.classes?.titleWrapper}
					>
						<SignalPortletTitle
							variant={"h5"}
							align={"center"}
							className={props.classes?.title}
						>
							{props.title}
						</SignalPortletTitle>
					</SignalPortletTitleWrapper>
					<SignalPortletDivider item className={props.classes?.divider}>
						<Divider />
					</SignalPortletDivider>
					<Grid item>
						<SignalPortletList className={props.classes?.list}>
							{props.items.map((item, index) => (
								<SignalPortletItemStyled
									key={index.toString()}
									className={props.classes?.item}
									{...item}
								/>
							))}
						</SignalPortletList>
					</Grid>
					{(props.updatedAt || props.onRefresh) && (
						<Grid
							item
							container
							spacing={1}
							justifyContent={"flex-end"}
							alignItems={"center"}
							alignContent={"center"}
						>
							{props.updatedAt && (
								<Grid item>
									<Tooltip
										title={new Date(props.updatedAt).toLocaleString(
											i18n.language,
										)}
									>
										<SignalPortletLastUpdatedAt>
											{t("standalone.signal-portlet.last-updated", {
												AGE: timestampToAge(new Date(props.updatedAt)),
											})}
										</SignalPortletLastUpdatedAt>
									</Tooltip>
								</Grid>
							)}
							{props.onRefresh && (
								<Grid item>
									<SignalPortletRefreshIconButton
										onClick={props.onRefresh}
										size={"small"}
										color={"primary"}
									>
										<SignalPortletRefreshIcon />
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
